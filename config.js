// Configuration loader for environment variables
// This file reads from .env.local for local development

function getYouTubeConfig() {
  // In production, these should be set via build process or hosting provider
  // For local development, you can manually set them here:
  return {
    CLIENT_ID:
      "777041723619-q959v3ol1fan2nnnked3s8eikfl75gll.apps.googleusercontent.com",
    API_KEY: "AIzaSyAYkcN08gGxCLHXAMAPkEHdKN9VR8WDAok",
  };
}
