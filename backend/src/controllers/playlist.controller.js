import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ✅ CREATE PLAYLIST
const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name?.trim()) {
        throw new ApiError(400, "Playlist name is mandatory.");
    }

    const playlist = await Playlist.create({
        name: name.trim(),
        description: description?.trim() || "",
        owner: req.user?._id
    });

    return res.status(201).json(
        new ApiResponse(201, playlist, "Playlist created successfully.")
    );
});

// ✅ GET USER PLAYLISTS
const getUserPlaylist = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "The provided userId format is invalid.");
    }

    const playlists = await Playlist.find({ owner: userId }).sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, playlists, "User playlists retrieved successfully.")
    );
});

// ✅ GET PLAYLIST BY ID
const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "The provided playlistId format is invalid.");
    }

    const playlist = await Playlist.findById(playlistId)
        .populate("owner", "username email avatar")
        .populate("videos", "videoFile thumbnail title duration views");

    if (!playlist) {
        throw new ApiError(404, "Target playlist could not be found.");
    }

    return res.status(200).json(
        new ApiResponse(200, playlist, "Playlist context fetched successfully.")
    );
});

// ✅ ADD VIDEO TO PLAYLIST
const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Both playlistId and videoId parameters must be valid ObjectIds.");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Target playlist could not be found.");
    }

    // Access Guard: Ensure only the account owner can push items into this collection
    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "Unauthorized: You do not own this playlist collection.");
    }

    // Explicit casting to match underlying data structures safely
    const videoObjectId = new mongoose.Types.ObjectId(videoId);
    if (playlist.videos.some(id => id.equals(videoObjectId))) {
        throw new ApiError(400, "This video already exists inside the targeted playlist.");
    }

    playlist.videos.push(videoObjectId);
    await playlist.save();

    return res.status(200).json(
        new ApiResponse(200, playlist, "Video successfully appended to your playlist.")
    );
});

// ✅ REMOVE VIDEO FROM PLAYLIST
const removeVideoPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Both playlistId and videoId parameters must be valid ObjectIds.");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Target playlist could not be found.");
    }

    // Access Guard: Verify authorization controls
    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "Unauthorized: You do not own this playlist collection.");
    }

    const initialLength = playlist.videos.length;
    playlist.videos = playlist.videos.filter(id => id.toString() !== videoId.toString());

    if (playlist.videos.length === initialLength) {
        throw new ApiError(404, "Target video was not found within this playlist collection.");
    }

    await playlist.save();

    return res.status(200).json(
        new ApiResponse(200, playlist, "Video successfully scrubbed from your playlist.")
    );
});

// ✅ DELETE PLAYLIST
const deleteUserPlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "The provided playlistId format is invalid.");
    }

    const deletedPlaylist = await Playlist.findOneAndDelete({
        _id: playlistId,
        owner: req.user?._id // Enforces secure user matching
    });

    if (!deletedPlaylist) {
        throw new ApiError(404, "Playlist not found or you lack modification authority over it.");
    }

    return res.status(200).json(
        new ApiResponse(200, deletedPlaylist, "Playlist permanently removed from system storage.")
    );
});

// ✅ UPDATE PLAYLIST DETAILS
const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "The provided playlistId format is invalid.");
    }

    if (!name?.trim() || !description?.trim()) {
        throw new ApiError(400, "Both updated name and text descriptions are required fields.");
    }

    const playlist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: req.user?._id
        },
        {
            $set: { 
                name: name.trim(), 
                description: description.trim() 
            }
        },
        { new: true }
    );

    if (!playlist) {
        throw new ApiError(404, "Playlist not found or you lack modification authority over it.");
    }

    return res.status(200).json(
        new ApiResponse(200, playlist, "Playlist details updated successfully.")
    );
});

export {
    createPlaylist,
    getUserPlaylist,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoPlaylist,
    deleteUserPlaylist,
    updatePlaylist
};
