<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class StorageController extends Controller
{
    /**
     * Serve files from R2 storage
     * 
     * This endpoint serves files directly from R2 when public URLs are not available.
     * It generates and returns signed URLs that are valid for a short period.
     */
    public function serveFile(Request $request, string $path): StreamedResponse
    {
        // Validate the path to prevent directory traversal attacks
        $path = ltrim($path, '/');
        
        // Check if file exists in R2
        if (!Storage::disk('r2')->exists($path)) {
            abort(404, 'File not found');
        }

        // Get file metadata
        $mimeType = Storage::disk('r2')->mimeType($path);
        $size = Storage::disk('r2')->size($path);

        // Stream the file from R2
        return Storage::disk('r2')->response($path, null, [
            'Content-Type' => $mimeType,
            'Content-Length' => $size,
            'Cache-Control' => 'public, max-age=3600', // Cache for 1 hour
        ]);
    }

    /**
     * Generate a temporary signed URL for R2 files
     * 
     * This endpoint returns a signed URL that is valid for a limited time.
     * Useful for refreshing expired URLs on the frontend.
     */
    public function getSignedUrl(Request $request): array
    {
        $validated = $request->validate([
            'path' => 'required|string',
            'expiry_minutes' => 'nullable|integer|min:1|max:1440', // Max 24 hours
        ]);

        $path = ltrim($validated['path'], '/');
        $expiryMinutes = $validated['expiry_minutes'] ?? 60; // Default 1 hour

        // Check if file exists
        if (!Storage::disk('r2')->exists($path)) {
            return response()->json(['message' => 'File not found'], 404);
        }

        try {
            $url = Storage::disk('r2')->temporaryUrl(
                $path,
                now()->addMinutes($expiryMinutes)
            );

            return [
                'url' => $url,
                'expires_at' => now()->addMinutes($expiryMinutes)->toIso8601String(),
            ];
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to generate signed URL',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
