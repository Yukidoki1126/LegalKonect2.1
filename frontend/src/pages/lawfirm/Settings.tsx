import React, { useState, useEffect, useRef } from 'react';
import api from '@/services/api';
import { Specialization } from '@/types';
import LawFirmLayoutNew from '@/components/lawfirm/LawFirmLayoutNew';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete, Libraries } from '@react-google-maps/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Building2, Camera, MapPin, Phone, Mail, FileText, Upload, Trash2, Settings as SettingsIcon, X, Image as ImageIcon, Plus, Loader2, Users, Briefcase, Lock, Key } from 'lucide-react';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
const libraries: Libraries = ["places"];

export default function ProfileSettings() {
    const [formData, setFormData] = useState({
        firm_name: '',
        description: '',
        experience_range: '',
        lawyers: [] as string[],
        contact_person_name: '',
        contact_person_role: '',
        contact_person_phone: '',
        contact_person_email: '',
        phone: '',
        email: '',
        address: '',
        latitude: null as number | null,
        longitude: null as number | null,
        specialization_ids: [] as number[],
    });
    const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
    const [galleryImages, setGalleryImages] = useState<string[]>([]);
    const [specializations, setSpecializations] = useState<Specialization[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingGallery, setUploadingGallery] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showMapModal, setShowMapModal] = useState(false);
    const [showGalleryModal, setShowGalleryModal] = useState(false);
    const [galleryModalContent, setGalleryModalContent] = useState({ type: '', title: '', message: '' });
    const [newLawyer, setNewLawyer] = useState('');
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [passwordError, setPasswordError] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);

    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const galleryInputRef = useRef<HTMLInputElement | null>(null);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries: libraries,
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [profile, specs] = await Promise.all([
                api.getLawFirmProfile(),
                api.getSpecializations(),
            ]);

            setFormData({
                firm_name: profile.firm_name,
                description: profile.description || '',
                experience_range: (profile as any).experience_range || '',
                lawyers: (profile as any).lawyers || [],
                contact_person_name: (profile as any).contact_person_name || '',
                contact_person_role: (profile as any).contact_person_role || '',
                contact_person_phone: (profile as any).contact_person_phone || '',
                contact_person_email: (profile as any).contact_person_email || '',
                phone: profile.phone || '',
                email: profile.email || '',
                address: profile.address || '',
                latitude: profile.latitude,
                longitude: profile.longitude,
                specialization_ids: profile.specializations?.map(s => s.id) || [],
            });
            setProfileImageUrl((profile as unknown as { profile_image_url: string | null }).profile_image_url);
            setGalleryImages((profile as unknown as { gallery_images_urls: string[] }).gallery_images_urls || []);
            setSpecializations(specs);
        } catch {
            console.error('Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'Image must be less than 5MB' });
            return;
        }

        // Validate file type
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            setMessage({ type: 'error', text: 'Only JPG, PNG, and WebP images are allowed' });
            return;
        }

        setUploadingImage(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await api.uploadLawFirmProfileImage(file);
            
            // Add cache-busting timestamp to force browser to reload the image
            const imageUrlWithTimestamp = `${response.profile_image_url}?t=${Date.now()}`;
            
            // Preload the image to ensure it's available before setting state
            const img = new Image();
            img.onload = () => {
                setProfileImageUrl(imageUrlWithTimestamp);
                setMessage({ type: 'success', text: 'Firm image uploaded successfully!' });
                setUploadingImage(false);
            };
            img.onerror = () => {
                setMessage({ type: 'error', text: 'Image uploaded but failed to display. Please refresh the page.' });
                setUploadingImage(false);
            };
            img.src = imageUrlWithTimestamp;
        } catch {
            setMessage({ type: 'error', text: 'Failed to upload image.' });
            setUploadingImage(false);
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleImageDelete = async () => {
        if (!confirm('Are you sure you want to remove the firm image?')) return;

        setUploadingImage(true);
        try {
            await api.deleteLawFirmProfileImage();
            setProfileImageUrl(null);
            setMessage({ type: 'success', text: 'Firm image removed successfully!' });
        } catch {
            setMessage({ type: 'error', text: 'Failed to remove image.' });
        } finally {
            setUploadingImage(false);
        }
    };

    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            setGalleryModalContent({
                type: 'error',
                title: 'File Too Large',
                message: 'Image must be less than 5MB. Please choose a smaller file.'
            });
            setShowGalleryModal(true);
            if (galleryInputRef.current) {
                galleryInputRef.current.value = '';
            }
            return;
        }

        // Validate file type
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            setGalleryModalContent({
                type: 'error',
                title: 'Invalid File Type',
                message: 'Only JPG, PNG, and WebP images are allowed.'
            });
            setShowGalleryModal(true);
            if (galleryInputRef.current) {
                galleryInputRef.current.value = '';
            }
            return;
        }

        setUploadingGallery(true);

        try {
            const response = await api.uploadLawFirmGalleryImage(file);
            setGalleryImages(response.gallery_images_urls);
            // No modal for success, just update the images
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            setGalleryModalContent({
                type: 'error',
                title: 'Upload Failed',
                message: err.response?.data?.message || 'Failed to upload image. Please try again.'
            });
            setShowGalleryModal(true);
        } finally {
            setUploadingGallery(false);
            if (galleryInputRef.current) {
                galleryInputRef.current.value = '';
            }
        }
    };

    const handleGalleryDelete = async (index: number) => {
        if (!confirm('Are you sure you want to remove this photo?')) return;

        setUploadingGallery(true);
        try {
            const response = await api.deleteLawFirmGalleryImage(index);
            setGalleryImages(response.gallery_images_urls);
            // No modal for success, just update the images
        } catch {
            setGalleryModalContent({
                type: 'error',
                title: 'Delete Failed',
                message: 'Failed to remove image. Please try again.'
            });
            setShowGalleryModal(true);
        } finally {
            setUploadingGallery(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePlaceChanged = () => {
        if (autocompleteRef.current !== null) {
            const place = autocompleteRef.current.getPlace();
            if (place.geometry && place.geometry.location) {
                setFormData(prev => ({
                    ...prev,
                    address: place.formatted_address || prev.address,
                    latitude: place.geometry!.location!.lat(),
                    longitude: place.geometry!.location!.lng(),
                }));
            }
        }
    };

    const handleMapClick = (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();

            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                if (status === 'OK' && results && results[0]) {
                    setFormData(prev => ({
                        ...prev,
                        address: results[0].formatted_address,
                        latitude: lat,
                        longitude: lng,
                    }));
                } else {
                    setFormData(prev => ({
                        ...prev,
                        latitude: lat,
                        longitude: lng,
                    }));
                }
            });
        }
    };

    const handleSpecializationToggle = (id: number) => {
        setFormData((prev) => ({
            ...prev,
            specialization_ids: prev.specialization_ids.includes(id)
                ? prev.specialization_ids.filter((s) => s !== id)
                : [...prev.specialization_ids, id],
        }));
    };

    const handleAddLawyer = () => {
        if (newLawyer.trim()) {
            setFormData(prev => ({
                ...prev,
                lawyers: [...prev.lawyers, newLawyer.trim()]
            }));
            setNewLawyer('');
        }
    };

    const handleRemoveLawyer = (index: number) => {
        setFormData(prev => ({
            ...prev,
            lawyers: prev.lawyers.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            // Update profile info
            await api.updateLawFirmProfile({
                firm_name: formData.firm_name,
                description: formData.description,
                experience_range: formData.experience_range,
                lawyers: formData.lawyers,
                contact_person_name: formData.contact_person_name,
                contact_person_role: formData.contact_person_role,
                contact_person_phone: formData.contact_person_phone,
                contact_person_email: formData.contact_person_email,
                phone: formData.phone,
                email: formData.email,
                specialization_ids: formData.specialization_ids,
            });

            // Update location if coordinates exist
            if (formData.latitude && formData.longitude) {
                await api.updateLawFirmLocation({
                    latitude: formData.latitude,
                    longitude: formData.longitude,
                    address: formData.address,
                });
            }

            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch {
            setMessage({ type: 'error', text: 'Failed to update profile.' });
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');

        // Validation
        if (!passwordForm.current_password || !passwordForm.new_password || !passwordForm.confirm_password) {
            setPasswordError('All fields are required');
            return;
        }

        if (passwordForm.new_password.length < 8) {
            setPasswordError('New password must be at least 8 characters');
            return;
        }

        if (passwordForm.new_password !== passwordForm.confirm_password) {
            setPasswordError('New passwords do not match');
            return;
        }

        setChangingPassword(true);

        try {
            await api.changePassword({
                current_password: passwordForm.current_password,
                new_password: passwordForm.new_password
            });

            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setShowPasswordModal(false);
            setPasswordForm({
                current_password: '',
                new_password: '',
                confirm_password: ''
            });
            setPasswordError('');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string; errors?: { current_password?: string[] } } } };
            // Check for validation errors first
            if (err.response?.data?.errors?.current_password) {
                setPasswordError(err.response.data.errors.current_password[0]);
            } else if (err.response?.data?.message) {
                setPasswordError(err.response.data.message);
            } else {
                setPasswordError('Failed to change password. Please try again.');
            }
        } finally {
            setChangingPassword(false);
        }
    };

    return (
        <LawFirmLayoutNew>
            <div className="space-y-8 p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="space-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-foreground">
                                <SettingsIcon className="h-8 w-8" />
                                Profile Settings
                            </h1>
                            <p className="text-muted-foreground text-lg">
                                Update your firm's public information and services
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setShowPasswordModal(true)}
                            className="flex items-center gap-2 text-foreground"
                        >
                            <Lock className="h-4 w-4" />
                            Change Password
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Loading profile...</p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Firm Information Section */}
                        <Card className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5" />
                                    Firm Information
                                </CardTitle>
                                <CardDescription>
                                    Basic information about your law firm
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="firm_name">Firm Name *</Label>
                                        <Input
                                            id="firm_name"
                                            name="firm_name"
                                            value={formData.firm_name}
                                            onChange={handleChange}
                                            required
                                            placeholder="Enter firm name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="flex items-center gap-2">
                                            <Phone className="h-4 w-4" />
                                            Contact Phone
                                        </Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="Enter phone number"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="flex items-center gap-2">
                                            <Mail className="h-4 w-4" />
                                            Public Email
                                        </Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Enter email address"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="address" className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />
                                            Office Address
                                        </Label>
                                        <div className="flex gap-2">
                                            {isLoaded ? (
                                                <Autocomplete
                                                    onLoad={ref => autocompleteRef.current = ref}
                                                    onPlaceChanged={handlePlaceChanged}
                                                    className="flex-1"
                                                >
                                                    <Input
                                                        id="address"
                                                        name="address"
                                                        value={formData.address}
                                                        onChange={handleChange}
                                                        placeholder="Enter office address"
                                                    />
                                                </Autocomplete>
                                            ) : (
                                                <Input
                                                    id="address"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleChange}
                                                    placeholder="Enter office address"
                                                    className="flex-1"
                                                />
                                            )}
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setShowMapModal(true)}
                                                title="Pin on Map"
                                            >
                                                <MapPin className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description" className="flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        Firm Description
                                    </Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={4}
                                        placeholder="Describe your firm, expertise, and services..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="experience_range" className="flex items-center gap-2">
                                        <Briefcase className="h-4 w-4" />
                                        Years of Experience
                                    </Label>
                                    <Select
                                        value={formData.experience_range}
                                        onValueChange={(value) => setFormData(prev => ({ ...prev, experience_range: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select experience range" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[200px]" sideOffset={5}>
                                            <SelectItem value="0-2 years">0-2 years</SelectItem>
                                            <SelectItem value="3-5 years">3-5 years</SelectItem>
                                            <SelectItem value="5-8 years">5-8 years</SelectItem>
                                            <SelectItem value="8-10 years">8-10 years</SelectItem>
                                            <SelectItem value="10-15 years">10-15 years</SelectItem>
                                            <SelectItem value="15-20 years">15-20 years</SelectItem>
                                            <SelectItem value="20+ years">20+ years</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="lawyers" className="flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        Lawyers at Firm
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="lawyers"
                                            value={newLawyer}
                                            onChange={(e) => setNewLawyer(e.target.value)}
                                            placeholder="Enter lawyer name"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddLawyer();
                                                }
                                            }}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleAddLawyer}
                                        >
                                            Add
                                        </Button>
                                    </div>
                                    {formData.lawyers.length > 0 && (
                                        <div className="mt-2 space-y-2">
                                            {formData.lawyers.map((lawyer, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between p-2 bg-muted rounded-md"
                                                >
                                                    <span className="text-sm text-foreground">{lawyer}</span>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRemoveLawyer(index)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contact Person Section */}
                        <Card className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Contact Person Information
                                </CardTitle>
                                <CardDescription>
                                    Information for the primary contact at your firm (secretary or staff)
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="contact_person_name">Contact Person Name</Label>
                                        <Input
                                            id="contact_person_name"
                                            name="contact_person_name"
                                            value={formData.contact_person_name}
                                            onChange={handleChange}
                                            placeholder="Enter contact person name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="contact_person_role">Role/Position</Label>
                                        <Input
                                            id="contact_person_role"
                                            name="contact_person_role"
                                            value={formData.contact_person_role}
                                            onChange={handleChange}
                                            placeholder="e.g., Secretary, Legal Assistant"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="contact_person_phone" className="flex items-center gap-2">
                                            <Phone className="h-4 w-4" />
                                            Contact Phone
                                        </Label>
                                        <Input
                                            id="contact_person_phone"
                                            name="contact_person_phone"
                                            type="tel"
                                            value={formData.contact_person_phone}
                                            onChange={handleChange}
                                            placeholder="Enter contact phone"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="contact_person_email" className="flex items-center gap-2">
                                            <Mail className="h-4 w-4" />
                                            Contact Email
                                        </Label>
                                        <Input
                                            id="contact_person_email"
                                            name="contact_person_email"
                                            type="email"
                                            value={formData.contact_person_email}
                                            onChange={handleChange}
                                            placeholder="Enter contact email"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Image Sections - Side by Side */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Profile Image Section */}
                            <Card className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Camera className="h-5 w-5" />
                                        Law Firm Image
                                    </CardTitle>
                                    <CardDescription>
                                        Upload a cover image of your office or firm (max 5MB, JPG/PNG/WebP)
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-6">
                                        <div className="h-32 w-32 rounded-lg border-2 border-dashed border-border overflow-hidden flex items-center justify-center bg-muted">
                                            {profileImageUrl ? (
                                                <img 
                                                    src={profileImageUrl} 
                                                    alt="Firm profile" 
                                                    className="h-full w-full object-cover"
                                                    key={profileImageUrl}
                                                />
                                            ) : (
                                                <Building2 className="h-16 w-16 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleImageUpload}
                                                accept="image/jpeg,image/png,image/webp"
                                                style={{ display: 'none' }}
                                                id="profile-image-input"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={uploadingImage}
                                            >
                                                <Upload className="mr-2 h-4 w-4" />
                                                {uploadingImage ? 'Uploading...' : (profileImageUrl ? 'Change Image' : 'Upload Image')}
                                            </Button>
                                            {profileImageUrl && (
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    onClick={handleImageDelete}
                                                    disabled={uploadingImage}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Remove
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Law Firm Photos Gallery */}
                            <Card className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ImageIcon className="h-5 w-5" />
                                        Law Firm Photo's
                                    </CardTitle>
                                    <CardDescription>
                                        Add more photos of your office, team, or facilities (max 5MB each, up to 10 photos)
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {/* Gallery Grid */}
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                                            {galleryImages.map((imageUrl, index) => (
                                                <div key={index} className="relative group aspect-square rounded-lg border-2 border-border overflow-hidden">
                                                    <img 
                                                        src={imageUrl} 
                                                        alt={`Firm photo ${index + 1}`} 
                                                        className="h-full w-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => handleGalleryDelete(index)}
                                                            disabled={uploadingGallery}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                            
                                            {/* Add Photo Button */}
                                            {galleryImages.length < 10 && (
                                                <div 
                                                    className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all cursor-pointer flex flex-col items-center justify-center gap-2"
                                                    onClick={() => !uploadingGallery && galleryInputRef.current?.click()}
                                                    style={{ opacity: uploadingGallery ? 0.6 : 1, pointerEvents: uploadingGallery ? 'none' : 'auto' }}
                                                >
                                                    {uploadingGallery ? (
                                                        <>
                                                            <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                                                            <span className="text-xs text-muted-foreground">Uploading...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Plus className="h-8 w-8 text-muted-foreground" />
                                                            <span className="text-xs text-muted-foreground">Add Photo</span>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        
                                        <input
                                            type="file"
                                            ref={galleryInputRef}
                                            onChange={handleGalleryUpload}
                                            accept="image/jpeg,image/png,image/webp"
                                            style={{ display: 'none' }}
                                            id="gallery-image-input"
                                        />
                                        
                                        {galleryImages.length >= 10 && (
                                            <p className="text-sm text-muted-foreground text-center">
                                                Maximum of 10 photos reached
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Specializations Section */}
                        <Card className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle>Areas of Practice</CardTitle>
                                <CardDescription>
                                    Select the legal specializations your firm offers
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {specializations.map((spec) => (
                                        <div key={spec.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`spec-${spec.id}`}
                                                checked={formData.specialization_ids.includes(spec.id)}
                                                onCheckedChange={() => { handleSpecializationToggle(spec.id); }}
                                            />
                                            <Label
                                                htmlFor={`spec-${spec.id}`}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                            >
                                                {spec.name}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                        
                        {/* Message section */}
                        {message.text && (
                            <div className={`p-4 rounded-lg border ${
                                message.type === 'success' 
                                    ? 'bg-green-50 border-green-200 text-green-800' 
                                    : 'bg-red-50 border-red-200 text-red-800'
                            }`}>
                                {message.text}
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex justify-end">
                            <Button type="submit" disabled={saving} size="lg">
                                {saving ? 'Saving Changes...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                )}

                {/* Map Modal */}
                {showMapModal && isLoaded && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <Card className="w-full max-w-3xl mx-4">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                <div>
                                    <CardTitle>Pin Office Location</CardTitle>
                                    <CardDescription>Click on the map to set your office location</CardDescription>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowMapModal(false)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="rounded-lg overflow-hidden border">
                                    <GoogleMap
                                        mapContainerStyle={{ width: '100%', height: '400px' }}
                                        center={
                                            formData.latitude && formData.longitude
                                                ? { lat: formData.latitude, lng: formData.longitude }
                                                : { lat: 14.5995, lng: 120.9842 }
                                        }
                                        zoom={15}
                                        onClick={handleMapClick}
                                    >
                                        {formData.latitude && formData.longitude && (
                                            <Marker position={{ lat: formData.latitude, lng: formData.longitude }} />
                                        )}
                                    </GoogleMap>
                                </div>
                                {formData.address && (
                                    <div className="p-3 bg-muted rounded-lg">
                                        <p className="text-sm font-medium text-muted-foreground mb-1">Selected Address:</p>
                                        <p className="text-sm text-foreground">{formData.address}</p>
                                    </div>
                                )}
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setShowMapModal(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={() => setShowMapModal(false)}>
                                        Confirm Location
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Gallery Upload Modal */}
                <Dialog open={showGalleryModal} onOpenChange={setShowGalleryModal}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className={galleryModalContent.type === 'success' ? 'text-green-600' : 'text-red-600'}>
                                {galleryModalContent.title}
                            </DialogTitle>
                            <DialogDescription className="pt-2">
                                {galleryModalContent.message}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-end">
                            <Button onClick={() => setShowGalleryModal(false)}>
                                Close
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Change Password Modal */}
                <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-foreground">
                                <Key className="h-5 w-5" />
                                Change Password
                            </DialogTitle>
                            <DialogDescription className="text-foreground pt-2">
                                Enter your current password and choose a new one
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="current_password" className="text-foreground font-medium">Current Password</Label>
                                <Input
                                    id="current_password"
                                    type="password"
                                    value={passwordForm.current_password}
                                    onChange={(e) => setPasswordForm(prev => ({ ...prev, current_password: e.target.value }))}
                                    placeholder="Enter current password"
                                    className="text-foreground"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new_password" className="text-foreground font-medium">New Password</Label>
                                <Input
                                    id="new_password"
                                    type="password"
                                    value={passwordForm.new_password}
                                    onChange={(e) => setPasswordForm(prev => ({ ...prev, new_password: e.target.value }))}
                                    placeholder="Enter new password (min 8 characters)"
                                    className="text-foreground"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm_password" className="text-foreground font-medium">Confirm New Password</Label>
                                <Input
                                    id="confirm_password"
                                    type="password"
                                    value={passwordForm.confirm_password}
                                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                                    placeholder="Confirm new password"
                                    className="text-foreground"
                                    required
                                />
                            </div>
                            {passwordError && (
                                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
                                    {passwordError}
                                </div>
                            )}
                            <div className="flex justify-end gap-2 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowPasswordModal(false);
                                        setPasswordForm({
                                            current_password: '',
                                            new_password: '',
                                            confirm_password: ''
                                        });
                                        setPasswordError('');
                                    }}
                                    className="text-foreground"
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={changingPassword}>
                                    {changingPassword ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Changing...
                                        </>
                                    ) : (
                                        'Change Password'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </LawFirmLayoutNew>
    );
}
