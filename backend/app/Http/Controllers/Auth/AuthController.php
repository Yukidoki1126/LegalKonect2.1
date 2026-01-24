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
use Illuminate\Validation\ValidationException;

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
}
