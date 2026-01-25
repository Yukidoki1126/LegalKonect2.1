<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\LawFirm;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Resend;

class AuthController extends Controller
{
    /**
     * Register a new client
     */
    public function registerClient(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'specialization_ids' => 'nullable|array',
            'specialization_ids.*' => 'exists:specializations,id',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'client',
        ]);

        $client = Client::create([
            'user_id' => $user->id,
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'] ?? null,
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
        ]);

        if (! empty($validated['specialization_ids'])) {
            $client->specializations()->sync($validated['specialization_ids']);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Client registered successfully',
            'user' => $user->load('client.specializations'),
            'token' => $token,
        ], 201);
    }

    /**
     * Register a new law firm
     */
    public function registerLawFirm(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'firm_name' => 'required|string|max:255',
            'license_number' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'experience_range' => 'nullable|string',
            'lawyers' => 'nullable|array',
            'lawyers.*' => 'string|max:255',
            'contact_person_name' => 'nullable|string|max:255',
            'contact_person_role' => 'nullable|string|max:255',
            'contact_person_phone' => 'nullable|string|max:20',
            'contact_person_email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'firm_email' => 'nullable|string|email|max:255',
            'address' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'specialization_ids' => 'nullable|array',
            'specialization_ids.*' => 'exists:specializations,id',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'law_firm',
        ]);

        $lawFirm = LawFirm::create([
            'user_id' => $user->id,
            'firm_name' => $validated['firm_name'],
            'license_number' => $validated['license_number'] ?? null,
            'description' => $validated['description'] ?? null,
            'experience_range' => $validated['experience_range'] ?? null,
            'lawyers' => $validated['lawyers'] ?? null,
            'contact_person_name' => $validated['contact_person_name'] ?? null,
            'contact_person_role' => $validated['contact_person_role'] ?? null,
            'contact_person_phone' => $validated['contact_person_phone'] ?? null,
            'contact_person_email' => $validated['contact_person_email'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'email' => $validated['firm_email'] ?? null,
            'address' => $validated['address'] ?? null,
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
            'verification_status' => 'pending',
        ]);

        if (! empty($validated['specialization_ids'])) {
            $lawFirm->specializations()->sync($validated['specialization_ids']);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Law firm registered successfully. Please wait for admin verification.',
            'user' => $user->load('lawFirm.specializations'),
            'token' => $token,
        ], 201);
    }

    /**
     * Login user
     */
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (! Auth::attempt($credentials)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $user = Auth::user();
        $token = $user->createToken('auth-token')->plainTextToken;

        // Load the appropriate relationship
        if ($user->isClient()) {
            $user->load('client.specializations');
        } elseif ($user->isLawFirm()) {
            $user->load('lawFirm.specializations');
        }

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    /**
     * Logout user
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    /**
     * Get current authenticated user
     */
    public function user(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->isClient()) {
            $user->load('client.specializations');
        } elseif ($user->isLawFirm()) {
            $user->load('lawFirm.specializations');
        }

        return response()->json($user);
    }

    /**
     * Change user password
     */
    public function changePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|different:current_password',
        ]);

        $user = $request->user();

        // Verify current password
        if (!Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        // Update password
        $user->password = Hash::make($validated['new_password']);
        $user->save();

        return response()->json([
            'message' => 'Password changed successfully',
        ]);
    }

    /**
     * Send password reset email
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $user = User::where('email', $validated['email'])->first();

        // Generate reset token
        $token = Str::random(64);

        // Store token in database
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $validated['email']],
            [
                'email' => $validated['email'],
                'token' => Hash::make($token),
                'created_at' => now(),
            ]
        );

        // Send email via Resend
        try {
            $resendApiKey = env('RESEND_API_KEY');
            
            if (!$resendApiKey) {
                throw new \Exception('Resend API key not configured');
            }

            $resend = Resend::client($resendApiKey);

            $resetUrl = env('FRONTEND_URL', 'http://localhost:5173') . '/reset-password?token=' . $token . '&email=' . urlencode($validated['email']);

            $resend->emails->send([
                'from' => 'LegalKonect <onboarding@resend.dev>',
                'to' => [$validated['email']],
                'subject' => 'Reset Your Password - LegalKonect',
                'html' => "
                    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                        <h2 style='color: #333;'>Reset Your Password</h2>
                        <p>Hello {$user->name},</p>
                        <p>We received a request to reset your password for your LegalKonect account.</p>
                        <p>Click the button below to reset your password:</p>
                        <div style='text-align: center; margin: 30px 0;'>
                            <a href='{$resetUrl}' style='background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;'>Reset Password</a>
                        </div>
                        <p>Or copy and paste this link into your browser:</p>
                        <p style='color: #666; word-break: break-all;'>{$resetUrl}</p>
                        <p style='color: #999; font-size: 14px; margin-top: 30px;'>This link will expire in 60 minutes.</p>
                        <p style='color: #999; font-size: 14px;'>If you didn't request a password reset, please ignore this email.</p>
                    </div>
                ",
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to send reset email. Please try again.',
                'error' => $e->getMessage(),
            ], 500);
        }

        return response()->json([
            'message' => 'Password reset link has been sent to your email',
        ]);
    }

    /**
     * Reset password using token
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email|exists:users,email',
            'token' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // Find token record
        $resetRecord = DB::table('password_reset_tokens')
            ->where('email', $validated['email'])
            ->first();

        if (!$resetRecord) {
            throw ValidationException::withMessages([
                'email' => ['No password reset request found for this email.'],
            ]);
        }

        // Verify token
        if (!Hash::check($validated['token'], $resetRecord->token)) {
            throw ValidationException::withMessages([
                'token' => ['Invalid or expired reset token.'],
            ]);
        }

        // Check if token is expired (60 minutes)
        if (now()->diffInMinutes($resetRecord->created_at) > 60) {
            DB::table('password_reset_tokens')->where('email', $validated['email'])->delete();
            throw ValidationException::withMessages([
                'token' => ['Reset token has expired. Please request a new one.'],
            ]);
        }

        // Update password
        $user = User::where('email', $validated['email'])->first();
        $user->password = Hash::make($validated['password']);
        $user->save();

        // Delete reset token
        DB::table('password_reset_tokens')->where('email', $validated['email'])->delete();

        return response()->json([
            'message' => 'Password has been reset successfully',
        ]);
    }
}
