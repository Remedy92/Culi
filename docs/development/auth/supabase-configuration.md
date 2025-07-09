# Supabase Authentication Configuration

This guide explains how to configure Supabase authentication for the Culi application, specifically for magic link (passwordless) authentication.

## Prerequisites

- Access to your Supabase project dashboard
- The project's environment variables configured

## Configuration Steps

### 1. Configure Redirect URLs in Supabase Dashboard

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **URL Configuration**
4. Add the following URLs to the **Redirect URLs** allowlist:

#### For Development:
```
http://localhost:3000/en/auth/callback
http://localhost:3000/nl/auth/callback
http://localhost:3000/fr/auth/callback
http://localhost:3000/de/auth/callback
http://localhost:3000/es/auth/callback
http://localhost:3000/it/auth/callback
```

Or use a wildcard pattern if supported:
```
http://localhost:3000/*/auth/callback
```

#### For Production:
Replace `your-domain.com` with your actual domain:
```
https://your-domain.com/en/auth/callback
https://your-domain.com/nl/auth/callback
https://your-domain.com/fr/auth/callback
https://your-domain.com/de/auth/callback
https://your-domain.com/es/auth/callback
https://your-domain.com/it/auth/callback
```

Or use a wildcard pattern if supported:
```
https://your-domain.com/*/auth/callback
```

### 2. Configure Email Templates (Optional)

To customize the magic link email:

1. Go to **Authentication** → **Email Templates**
2. Select **Magic Link**
3. Customize the email template as needed
4. Ensure the redirect URL uses the variable `{{ .SiteURL }}` with the proper callback path

### 3. Environment Variables

Ensure your environment variables are properly configured:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Important: Set this to your production URL when deploying
NEXT_PUBLIC_URL=http://localhost:3000  # For development
# NEXT_PUBLIC_URL=https://your-domain.com  # For production
```

## How It Works

1. User enters their email on the sign-in page
2. The app sends a request to `/api/auth/magic-link`
3. Supabase sends an email with a magic link
4. The link includes a `code` parameter and redirects to the configured URL
5. The middleware intercepts requests with a `code` parameter
6. If the code is at the root URL, it redirects to `/{locale}/auth/callback`
7. The callback route exchanges the code for a session
8. User is redirected to dashboard or onboarding based on their status

## Troubleshooting

### Issue: Redirect goes to base URL instead of callback

**Symptoms**: Clicking the magic link takes you to `localhost:3000/?code=...` instead of `localhost:3000/{locale}/auth/callback?code=...`

**Solution**: 
1. Verify the redirect URLs are properly configured in Supabase Dashboard
2. The middleware now handles this case and redirects appropriately
3. Check that `NEXT_PUBLIC_URL` is set correctly in your environment

### Issue: "Invalid redirect URL" error

**Solution**: 
1. Ensure all locale-specific callback URLs are added to Supabase
2. Check that the URL format matches exactly (including protocol and port)
3. Remember that Supabase URLs are case-sensitive

### Debugging Tips

1. Check the console logs when sending a magic link - the route now logs the redirect URL
2. Verify the email template in Supabase is using the correct variables
3. Test with different locales to ensure all are properly configured

## Security Considerations

- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client
- Always use HTTPS in production
- Regularly rotate your API keys
- Consider implementing rate limiting on the magic link endpoint