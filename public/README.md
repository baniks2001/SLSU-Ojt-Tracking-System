# Public Assets Folder

## Logo Placement

To add your SLSU logo to the system:

1. **Add your logo file** to this folder (`/public`)
   - Recommended formats: `.png`, `.jpg`, `.svg`
   - Recommended size: 512x512 pixels or larger
   - Keep file size under 500KB for optimal loading

2. **Update the Logo component** at `/src/components/Logo.tsx`
   - Uncomment the Image component section
   - Update the `src` path to match your filename
   - Example: `src="/slsu-logo.png"`

3. **Clear browser cache** after updating the logo

## Other Static Assets

You can also add other static files to this folder:
- Favicon: `favicon.ico`
- Images for announcements
- PDF templates
- Other downloadable resources
