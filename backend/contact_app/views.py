from django.http import JsonResponse


def root(request):
    """Avoid 404 on GET / — the API lives under /api/."""
    return JsonResponse(
        {
            "service": "Sri Raja Solar API",
            "ok": True,
            "api_base": "/api/",
            "try": {
                "slider_images": "/api/slider-images/",
                "create_contact": "POST /api/create-contact/",
            },
        }
    )
