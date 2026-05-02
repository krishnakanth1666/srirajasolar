from django.contrib import admin
from .models import Contact, SliderImage

@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone', 'short_message', 'created_at')
    search_fields = ('name', 'email', 'phone', 'message')
    list_filter = ('created_at',)
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)

    fieldsets = (
        ('Customer Details', {
            'fields': ('name', 'email', 'phone')
        }),
        ('Message', {
            'fields': ('message',)
        }),
        ('Metadata', {
            'fields': ('created_at',)
        }),
    )

    def short_message(self, obj):
        if not obj.message:
            return '-'
        return obj.message[:60] + '...' if len(obj.message) > 60 else obj.message
    short_message.short_description = 'Message'

@admin.register(SliderImage)
class SliderImageAdmin(admin.ModelAdmin):
    list_display = ('title', 'order', 'is_active', 'image_present', 'updated_at')
    list_editable = ('order', 'is_active')
    ordering = ('order', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('title',) 
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        ('Slide Details', {
            'fields': ('title', 'image', 'order', 'is_active')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at')
        }),
    )

    actions = ('mark_active', 'mark_inactive')

    def image_present(self, obj):
        return bool(obj.image)
    image_present.boolean = True
    image_present.short_description = 'Image'

    @admin.action(description='Mark selected slides as active')
    def mark_active(self, request, queryset):
        queryset.update(is_active=True)

    @admin.action(description='Mark selected slides as inactive')
    def mark_inactive(self, request, queryset):
        queryset.update(is_active=False)