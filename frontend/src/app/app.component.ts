import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
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
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  title = 'solar_frontend';
  readonly currentYear = new Date().getFullYear();
  contactForm: FormGroup;
  message = '';
  success = false;
  showMessage = false;
  slides: Slide[] = [];
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
    this.fetchSliderImages();
    this.startTestimonialCarousel();
  }

  ngAfterViewInit() {
    // Initialize map after view is ready
    setTimeout(() => {
      this.initMap();
    }, 1000); // Give some time for the DOM to be ready
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

  initMap() {
    try {
      const mapElement = document.getElementById('map');
      if (!mapElement) {
        console.error('Map element not found');
        return;
      }

      if (typeof google === 'undefined' || !google.maps) {
        console.error('Google Maps script not loaded');
        return;
      }

      // Srirajasolar location in Rajahmundry
      const companyLocation = { lat: 16.99887, lng: 81.77959 };
      const map = new google.maps.Map(mapElement, {
        zoom: 15,
        center: companyLocation,
        styles: [
          {
            "featureType": "all",
            "elementType": "geometry",
            "stylers": [{"color": "#1E3D59"}]
          }
        ]
      });

      const marker = new google.maps.Marker({
        position: companyLocation,
        map: map,
        title: 'Srirajasolar',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor: '#FF6B6B',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        }
      });

      // Add info window with company details
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 250px;">
            <h3 style="color: #1E3D59; margin: 0 0 3px 0; font-size: 14px;">Srirajasolar</h3>
            <p style="margin: 0; font-size: 12px;">Door No: 45-22-18, ByPass Road</p>
            <p style="margin: 2px 0; font-size: 12px;">Thadithota Junction, Rajahmundry</p>
            <p style="margin: 2px 0; font-size: 12px;">Andhra Pradesh - 533103</p>
            <p style="margin: 2px 0; font-size: 12px;">Phone: +91 6262959579</p>
            <p style="margin: 2px 0; font-size: 12px;">Email: srirajasolar&#64;gmail.com</p>
          </div>
        `
      });

      // Open info window by default
      infoWindow.open(map, marker);

      // Keep the click listener to allow reopening the info window
      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  fetchSliderImages() {
    // Try to fetch from API first, fallback to local images
    this.http.get<Slide[]>(`${environment.apiUrl}/slider-images/`)
      .subscribe({
        next: (data) => {
          if (data && data.length > 0) {
            // Process image URLs - use local assets if URL points to media
            const preparedSlides = data.map(slide => {
              // If image_url is from backend media, convert to local assets path
              if (slide.image_url && slide.image_url.includes('/media/slider_images/')) {
                const filename = slide.image_url.split('/').pop();
                // Ensure proper case for Solar_image files
                const correctedFilename = filename && filename.toLowerCase().includes('solar_image') 
                  ? filename.replace(/solar_image/i, 'Solar_image')
                  : filename;
                return { ...slide, image_url: `assets/${correctedFilename}` };
              }
              return slide;
            });

            // Drop records that don't have a valid image URL to avoid blank slides.
            this.slides = preparedSlides.filter(slide => !!slide.image_url);

            // Sort slides by order to ensure correct sequence
            this.slides.sort((a, b) => (a.order || 0) - (b.order || 0));

            if (this.slides.length > 0) {
              // Preload images to ensure they're ready
              this.preloadImages();
            } else {
              // Fallback when API images are invalid/missing
              this.slides = [
                { id: 1, title: 'Solar Installation', image_url: 'assets/solar_installation.jpg', order: 1 }
              ];
            }
          } else {
            // Fallback to local images if API returns empty
            this.slides = [
              { id: 1, title: 'Solar Installation', image_url: 'assets/solar_installation.jpg', order: 1 }
            ];
          }
          this.startSlideshow();
        },
        error: () => {
          // Fallback to local images on error
          this.slides = [
            { id: 1, title: 'Solar Installation', image_url: 'assets/solar_installation.jpg', order: 1 }
          ];
          this.startSlideshow();
        }
      });
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
    
    // Try to fix case sensitivity issues
    const currentSrc = img.src;
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
        { id: 1, title: 'Solar Installation', image_url: 'assets/solar_installation.jpg', order: 1 }
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