<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('law-firm.{id}', function ($user, $id) {
    return $user->role === 'law_firm' && (int) $user->lawFirm->id === (int) $id;
});

Broadcast::channel('client.{id}', function ($user, $id) {
    return $user->role === 'client' && (int) $user->client->id === (int) $id;
});
