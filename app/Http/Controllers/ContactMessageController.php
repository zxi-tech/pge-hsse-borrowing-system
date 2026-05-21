<?php

namespace App\Http\Controllers;

use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContactMessageController extends Controller
{
    // Handle incoming contact messages dari frontend. 
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'nullable|string|max:255',
            'message' => 'required|string',
        ]);

        ContactMessage::create($request->all());

        return back()->with('success', 'Pesan Anda berhasil dikirim! Tim Admin HSSE akan segera meninjaunya.');
    }

    // Render data inbox ke dashboard Admin via Inertia.
    public function index()
    {
        $messages = ContactMessage::latest()->paginate(10);

        return Inertia::render('Dashboard/Messages', [
            'messages' => $messages
        ]);
    }

    // Flagging status pesan. Update state 'is_read' menjadi true 
    public function markAsRead($id)
    {
        $message = ContactMessage::findOrFail($id);
        $message->update(['is_read' => true]);

        return back();
    }

    // Hard delete message record dari database. 
    public function destroy($id)
    {
        $message = ContactMessage::findOrFail($id);
        $message->delete();

        return back()->with('success', 'Pesan berhasil dihapus.');
    }
}