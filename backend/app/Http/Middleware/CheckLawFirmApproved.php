<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckLawFirmApproved
{
    /**
     * Ensure law firm is approved before accessing certain routes
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->isLawFirm()) {
            $lawFirm = $user->lawFirm;

            if (!$lawFirm || !$lawFirm->isApproved()) {
                return response()->json([
                    'message' => 'Your law firm is not yet approved. Please wait for admin verification.',
                    'verification_status' => $lawFirm ? $lawFirm->verification_status : 'unknown',
                ], 403);
            }
        }

        return $next($request);
    }
}
