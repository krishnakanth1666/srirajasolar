import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { environment } from '../environments/environment';
import { finalize } from 'rxjs/operators';

interface Slide {
  id: number;
  title: string;
  image_url: string;
  order: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'solar_frontend';
  readonly currentYear = new Date().getFullYear();
  contactForm: FormGroup;
  message = '';
  success = false;
  showMessage = false;
  slides: Slide[] = [];
  mobileMenuOpen = false;
  currentSlideIndex = 0;
  private slideInterval: any;
  private readonly SLIDE_DURATION = 5000; // 5 seconds per slide
  private readonly TRANSITION_DURATION = 500; // 500ms transition
  isTransitioning = false;
  
  // Testimonials
  testimonials = [
    {
      id: 1,
      text: "Srirajasolar installed a 5kW system for our home. The installation was professional, and we've seen a significant reduction in our electricity bills. Highly recommended!",
      author: "Ramesh Kumar",
      role: "Homeowner, Rajahmundry",
      rating: 5
    },
    {
      id: 2,
      text: "We switched to solar power for our business, and it was the best decision we made. The team at Srirajasolar was knowledgeable and provided excellent service throughout the process.",
      author: "Priya Sharma",
      role: "Business Owner, Kakinada",
      rating: 5
    },
    {
      id: 3,
      text: "The maintenance service provided by Srirajasolar is exceptional. They regularly check our system and ensure everything is working perfectly. Great customer service!",
      author: "Venkat Rao",
      role: "Factory Owner, Visakhapatnam",
      rating: 5
    }
  ];
  currentTestimonialIndex = 0;
  private testimonialInterval: any;

  /** Bundled slider images when API media is missing (e.g. ephemeral hosting) or URLs fail. */
  private readonly localSliderSlides: Slide[] = [
    ...[1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({
      id: n,
      title: `Solar ${n}`,
      image_url: `assets/Solar_image_${n}.jpeg`,
      order: n,
    })),
  ];

  /** Slides excluded from the hero carousel. */
  private readonly excludedSliderImagePatterns = [
    /Solar_image_9\.(jpe?g|png|webp)/i,
    /solar_image_9\.(jpe?g|png|webp)/i,
    /solar_installation\.(jpe?g|png|webp)/i,
  ];

  private filterExcludedSlides(slides: Slide[]): Slide[] {
    return slides.filter(
      (slide) =>
        !this.excludedSliderImagePatterns.some((pattern) =>
          pattern.test(slide.image_url)
        )
    );
  }

  /**
   * Planning-only estimates for avoided grid emissions (India-style rough factors).
   * Not a carbon credit certificate; helps visualize impact similar to industry sustainability sections.
   */
  carbonCalcKw = 5;
  private readonly KWH_PER_KW_YEAR = 1400;
  private readonly GRID_CO2_KG_PER_KWH = 0.75;

  get carbonAnnualKwh(): number {
    return Math.round(this.carbonCalcKw * this.KWH_PER_KW_YEAR);
  }

  get carbonTonsCo2(): number {
    const kg = this.carbonAnnualKwh * this.GRID_CO2_KG_PER_KWH;
    return Math.round((kg / 1000) * 10) / 10;
  }

  /** Rough equivalence: ~21 kg CO₂ absorbed per tree per year (order-of-magnitude). */
  get carbonTreesEquivalent(): number {
    const kg = this.carbonAnnualKwh * this.GRID_CO2_KG_PER_KWH;
    return Math.max(1, Math.round(kg / 21));
  }

  setCarbonKw(value: number | string): void {
    const n = typeof value === 'string' ? parseFloat(value) : value;
    if (!Number.isFinite(n)) {
      this.carbonCalcKw = 5;
      return;
    }
    this.carbonCalcKw = Math.min(2000, Math.max(0.5, n));
  }

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [
        Validators.required,
        Validators.pattern(/^[6-9]\d{9}$/),
        Validators.minLength(10),
        Validators.maxLength(10)
      ]],
      message: ['']
    });
  }

  ngOnInit() {
    this.slides = this.filterExcludedSlides([...this.localSliderSlides]);
    this.startSlideshow();
    this.fetchSliderImages();
    this.startTestimonialCarousel();
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  getAuthorInitials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }

  ngOnDestroy() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
    if (this.testimonialInterval) {
      clearInterval(this.testimonialInterval);
    }
  }
  
  // Testimonial carousel methods
  startTestimonialCarousel() {
    if (this.testimonials.length > 1) {
      this.testimonialInterval = setInterval(() => {
        this.nextTestimonial();
      }, 6000); // Change every 6 seconds
    }
  }
  
  nextTestimonial() {
    this.currentTestimonialIndex = (this.currentTestimonialIndex + 1) % this.testimonials.length;
  }
  
  prevTestimonial() {
    this.currentTestimonialIndex = (this.currentTestimonialIndex - 1 + this.testimonials.length) % this.testimonials.length;
  }
  
  goToTestimonial(index: number) {
    this.currentTestimonialIndex = index;
    // Reset interval
    if (this.testimonialInterval) {
      clearInterval(this.testimonialInterval);
    }
    this.startTestimonialCarousel();
  }

  fetchSliderImages() {
    this.http.get<Slide[]>(`${environment.apiUrl}/slider-images/`)
      .subscribe({
        next: (data) => {
          if (!data || data.length === 0) {
            return;
          }

          const preparedSlides = data.map((slide) => ({
            ...slide,
            image_url: this.normalizeSlideImageUrl(slide.image_url),
          }));

          let nextSlides = preparedSlides.filter((slide) => !!slide.image_url);
          nextSlides.sort((a, b) => (a.order || 0) - (b.order || 0));
          nextSlides = this.filterExcludedSlides(nextSlides);

          if (nextSlides.length === 0) {
            return;
          }

          this.slides = nextSlides;
          this.currentSlideIndex = 0;
          this.preloadImages();
          this.startSlideshow();
        },
        error: () => {
          // Keep bundled slides already shown
        }
      });
  }

  private normalizeSlideImageUrl(imageUrl: string | null | undefined): string {
    if (!imageUrl) return '';
    let url = imageUrl.trim();
    if (
      typeof window !== 'undefined' &&
      window.location.protocol === 'https:' &&
      url.startsWith('http://')
    ) {
      url = `https://${url.slice(7)}`;
    }
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // Build absolute URL when backend returns relative media path
    const apiOrigin = new URL(environment.apiUrl).origin;
    if (url.startsWith('/')) {
      return `${apiOrigin}${url}`;
    }
    return `${apiOrigin}/${url}`;
  }

  /** Map failed remote/media URL to bundled asset filename (Render media often 404s). */
  private tryMapRemoteUrlToLocalAsset(src: string): string | null {
    try {
      const u = new URL(src, 'https://placeholder.local');
      const file = u.pathname.split('/').pop() || '';
      if (file && /\.(jpe?g|png|webp)$/i.test(file)) {
        const normalized = file.replace(/solar_image/gi, 'Solar_image');
        const localPath = `assets/${normalized}`;
        if (this.excludedSliderImagePatterns.some((pattern) => pattern.test(localPath))) {
          return null;
        }
        return localPath;
      }
    } catch {
      if (src.includes('media/') || src.includes('slider_images')) {
        const parts = src.split('/');
        const file = parts.pop() || '';
        if (file) {
          return `assets/${file.replace(/solar_image/gi, 'Solar_image')}`;
        }
      }
    }
    return null;
  }

  startSlideshow() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }

    // Show first slide immediately
    this.showSlide(0);
    
    // Auto-advance slides if there's more than one
    if (this.slides.length > 1) {
      this.slideInterval = setInterval(() => {
        this.nextSlide();
      }, this.SLIDE_DURATION);
    }
  }

  showSlide(index: number) {
    if (this.isTransitioning) return;
    if (index < 0 || index >= this.slides.length) return;
    
    this.isTransitioning = true;
    this.currentSlideIndex = index;

    // Reset transition flag after animation completes
    setTimeout(() => {
      this.isTransitioning = false;
    }, this.TRANSITION_DURATION);
  }

  nextSlide() {
    if (this.isTransitioning) return;
    
    const nextIndex = (this.currentSlideIndex + 1) % this.slides.length;
    this.showSlide(nextIndex);
  }

  prevSlide() {
    if (this.isTransitioning) return;
    
    const prevIndex = (this.currentSlideIndex - 1 + this.slides.length) % this.slides.length;
    this.showSlide(prevIndex);
  }

  goToSlide(index: number) {
    if (this.isTransitioning) return;
    this.showSlide(index);
  }

  preloadImages() {
    // Preload all slide images
    this.slides.forEach((slide, index) => {
      const img = new Image();
      img.src = slide.image_url;
      img.onerror = () => {
        if (slide.image_url.includes('solar_image')) {
          const correctedUrl = slide.image_url.replace(/solar_image/i, 'Solar_image');
          const retryImg = new Image();
          retryImg.src = correctedUrl;
          retryImg.onload = () => {
            this.slides[index].image_url = correctedUrl;
          };
        }
      };
    });
  }

  onImageLoad(event: any) {
    // Image loaded successfully
    event.target.classList.remove('error');
  }

  handleImageError(event: any) {
    const img = event.target;
    img.classList.add('error');
    
    const currentSrc = img.src;

    if (currentSrc.startsWith('http://') && !img.dataset['retriedHttps']) {
      img.dataset['retriedHttps'] = 'true';
      img.src = currentSrc.replace(/^http:\/\//i, 'https://');
      return;
    }

    const localFromRemote = this.tryMapRemoteUrlToLocalAsset(currentSrc);
    if (localFromRemote && !img.dataset['retriedLocal']) {
      img.dataset['retriedLocal'] = 'true';
      img.src = localFromRemote;
      return;
    }

    // Try to fix case sensitivity issues
    if (currentSrc.includes('assets/')) {
      const filename = currentSrc.split('/').pop();
      // Try with different case variations
      if (filename && filename.toLowerCase().includes('solar_image')) {
        const correctedName = filename.replace(/solar_image/i, 'Solar_image');
        const newSrc = `assets/${correctedName}`;
        // Only retry once to avoid infinite loop
        if (!img.dataset.retried) {
          img.dataset.retried = 'true';
          img.src = newSrc;
          return;
        }
      }
    }

    // If it still fails after retry, remove that slide from rotation.
    const failedSrc = img.src as string;
    const failedIndex = this.slides.findIndex((slide) =>
      failedSrc.includes(slide.image_url) || failedSrc.endsWith(slide.image_url)
    );
    if (failedIndex !== -1) {
      this.removeSlideAt(failedIndex);
    }
  }

  private removeSlideAt(index: number) {
    if (index < 0 || index >= this.slides.length) return;

    this.slides.splice(index, 1);

    if (this.slides.length === 0) {
      this.slides = [
        { id: 1, title: 'Solar 1', image_url: 'assets/Solar_image_1.jpeg', order: 1 }
      ];
      this.currentSlideIndex = 0;
      this.startSlideshow();
      return;
    }

    if (this.currentSlideIndex >= this.slides.length) {
      this.currentSlideIndex = 0;
    }
  }

  private formatContactSubmitError(err: HttpErrorResponse): string {
    if (err.status === 0) {
      return 'Cannot reach the server. Check your connection or try again later.';
    }
    const body = err.error;
    if (body && typeof body === 'object' && !Array.isArray(body)) {
      const detail = (body as { detail?: string }).detail;
      if (typeof detail === 'string') {
        return detail;
      }
      const fieldMessages = Object.entries(body)
        .filter(([key]) => key !== 'detail')
        .map(([key, val]) => {
          const msg = Array.isArray(val) ? val.join(' ') : String(val);
          return `${key}: ${msg}`;
        });
      if (fieldMessages.length) {
        return fieldMessages.join(' ');
      }
    }
    if (typeof body === 'string' && body.length > 0 && body.length < 400) {
      return body;
    }
    return 'There was an error submitting your message. Please try again later.';
  }

  onSubmit() {
    if (this.contactForm.valid) {
      const raw = this.contactForm.getRawValue();
      const formData = {
        name: (raw.name ?? '').trim(),
        email: (raw.email ?? '').trim(),
        phone: (raw.phone ?? '').trim(),
        message: (raw.message ?? '').trim(),
      };
      if (!formData.name || !formData.email || !formData.phone) {
        Object.keys(this.contactForm.controls).forEach((key) => {
          this.contactForm.get(key)?.markAsTouched();
        });
        this.showMessage = true;
        this.success = false;
        this.message = 'Please fill in all required fields correctly.';
        setTimeout(() => {
          this.showMessage = false;
        }, 4000);
        return;
      }

      this.contactForm.disable();
      this.http
        .post(`${environment.apiUrl}/create-contact/`, formData)
        .pipe(finalize(() => this.contactForm.enable()))
        .subscribe({
          next: () => {
            this.showMessage = true;
            this.success = true;
            this.message = 'Thank you for your message! We will get back to you soon.';
            this.contactForm.reset();
            setTimeout(() => {
              this.showMessage = false;
            }, 5000);
          },
          error: (error: HttpErrorResponse) => {
            this.showMessage = true;
            this.success = false;
            this.message = this.formatContactSubmitError(error);
            setTimeout(() => {
              this.showMessage = false;
            }, 8000);
          },
        });
    } else {
      // Mark all fields as touched to show errors
      Object.keys(this.contactForm.controls).forEach(key => {
        this.contactForm.get(key)?.markAsTouched();
      });
      this.showMessage = true;
      this.success = false;
      this.message = 'Please fill in all required fields correctly.';
      setTimeout(() => {
        this.showMessage = false;
      }, 4000);
    }
  }
} 