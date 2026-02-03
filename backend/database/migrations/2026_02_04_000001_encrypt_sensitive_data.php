<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use App\Models\Client;
use App\Models\LawFirm;
use App\Models\Appointment;
use App\Services\EncryptionService;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * This migration encrypts existing sensitive data in the database.
     * Fields that will be encrypted:
     * - clients: phone, address
     * - law_firms: license_number, phone, address, contact_person_phone, contact_person_email
     * - appointments: notes, cancellation_reason
     */
    public function up(): void
    {
        // Note: We're not changing table structure, just encrypting existing data
        // The Encrypted cast will handle encryption/decryption automatically going forward
        
        $this->encryptClientData();
        $this->encryptLawFirmData();
        $this->encryptAppointmentData();
    }

    /**
     * Encrypt client sensitive data
     */
    private function encryptClientData(): void
    {
        // Temporarily disable Eloquent events and get raw data
        $clients = DB::table('clients')->get();

        foreach ($clients as $client) {
            $updates = [];

            // Only encrypt if data exists and is not already encrypted
            if ($client->phone && !EncryptionService::isEncrypted($client->phone)) {
                $updates['phone'] = EncryptionService::encrypt($client->phone);
            }

            if ($client->address && !EncryptionService::isEncrypted($client->address)) {
                $updates['address'] = EncryptionService::encrypt($client->address);
            }

            if (!empty($updates)) {
                DB::table('clients')->where('id', $client->id)->update($updates);
                echo "Encrypted client ID: {$client->id}\n";
            }
        }

        echo "Completed encrypting " . count($clients) . " client records\n";
    }

    /**
     * Encrypt law firm sensitive data
     */
    private function encryptLawFirmData(): void
    {
        $lawFirms = DB::table('law_firms')->get();

        foreach ($lawFirms as $lawFirm) {
            $updates = [];

            if ($lawFirm->license_number && !EncryptionService::isEncrypted($lawFirm->license_number)) {
                $updates['license_number'] = EncryptionService::encrypt($lawFirm->license_number);
            }

            if ($lawFirm->phone && !EncryptionService::isEncrypted($lawFirm->phone)) {
                $updates['phone'] = EncryptionService::encrypt($lawFirm->phone);
            }

            if ($lawFirm->address && !EncryptionService::isEncrypted($lawFirm->address)) {
                $updates['address'] = EncryptionService::encrypt($lawFirm->address);
            }

            if ($lawFirm->contact_person_phone && !EncryptionService::isEncrypted($lawFirm->contact_person_phone)) {
                $updates['contact_person_phone'] = EncryptionService::encrypt($lawFirm->contact_person_phone);
            }

            if ($lawFirm->contact_person_email && !EncryptionService::isEncrypted($lawFirm->contact_person_email)) {
                $updates['contact_person_email'] = EncryptionService::encrypt($lawFirm->contact_person_email);
            }

            if (!empty($updates)) {
                DB::table('law_firms')->where('id', $lawFirm->id)->update($updates);
                echo "Encrypted law firm ID: {$lawFirm->id}\n";
            }
        }

        echo "Completed encrypting " . count($lawFirms) . " law firm records\n";
    }

    /**
     * Encrypt appointment sensitive data
     */
    private function encryptAppointmentData(): void
    {
        $appointments = DB::table('appointments')->get();

        foreach ($appointments as $appointment) {
            $updates = [];

            if ($appointment->notes && !EncryptionService::isEncrypted($appointment->notes)) {
                $updates['notes'] = EncryptionService::encrypt($appointment->notes);
            }

            if ($appointment->cancellation_reason && !EncryptionService::isEncrypted($appointment->cancellation_reason)) {
                $updates['cancellation_reason'] = EncryptionService::encrypt($appointment->cancellation_reason);
            }

            if (!empty($updates)) {
                DB::table('appointments')->where('id', $appointment->id)->update($updates);
                echo "Encrypted appointment ID: {$appointment->id}\n";
            }
        }

        echo "Completed encrypting " . count($appointments) . " appointment records\n";
    }

    /**
     * Reverse the migrations.
     * 
     * Warning: This will decrypt all encrypted data back to plain text.
     * Use with caution in production!
     */
    public function down(): void
    {
        $this->decryptClientData();
        $this->decryptLawFirmData();
        $this->decryptAppointmentData();
    }

    private function decryptClientData(): void
    {
        $clients = DB::table('clients')->get();

        foreach ($clients as $client) {
            $updates = [];

            if ($client->phone && EncryptionService::isEncrypted($client->phone)) {
                $updates['phone'] = EncryptionService::decrypt($client->phone);
            }

            if ($client->address && EncryptionService::isEncrypted($client->address)) {
                $updates['address'] = EncryptionService::decrypt($client->address);
            }

            if (!empty($updates)) {
                DB::table('clients')->where('id', $client->id)->update($updates);
            }
        }
    }

    private function decryptLawFirmData(): void
    {
        $lawFirms = DB::table('law_firms')->get();

        foreach ($lawFirms as $lawFirm) {
            $updates = [];

            if ($lawFirm->license_number && EncryptionService::isEncrypted($lawFirm->license_number)) {
                $updates['license_number'] = EncryptionService::decrypt($lawFirm->license_number);
            }

            if ($lawFirm->phone && EncryptionService::isEncrypted($lawFirm->phone)) {
                $updates['phone'] = EncryptionService::decrypt($lawFirm->phone);
            }

            if ($lawFirm->address && EncryptionService::isEncrypted($lawFirm->address)) {
                $updates['address'] = EncryptionService::decrypt($lawFirm->address);
            }

            if ($lawFirm->contact_person_phone && EncryptionService::isEncrypted($lawFirm->contact_person_phone)) {
                $updates['contact_person_phone'] = EncryptionService::decrypt($lawFirm->contact_person_phone);
            }

            if ($lawFirm->contact_person_email && EncryptionService::isEncrypted($lawFirm->contact_person_email)) {
                $updates['contact_person_email'] = EncryptionService::decrypt($lawFirm->contact_person_email);
            }

            if (!empty($updates)) {
                DB::table('law_firms')->where('id', $lawFirm->id)->update($updates);
            }
        }
    }

    private function decryptAppointmentData(): void
    {
        $appointments = DB::table('appointments')->get();

        foreach ($appointments as $appointment) {
            $updates = [];

            if ($appointment->notes && EncryptionService::isEncrypted($appointment->notes)) {
                $updates['notes'] = EncryptionService::decrypt($appointment->notes);
            }

            if ($appointment->cancellation_reason && EncryptionService::isEncrypted($appointment->cancellation_reason)) {
                $updates['cancellation_reason'] = EncryptionService::decrypt($appointment->cancellation_reason);
            }

            if (!empty($updates)) {
                DB::table('appointments')->where('id', $appointment->id)->update($updates);
            }
        }
    }
};
