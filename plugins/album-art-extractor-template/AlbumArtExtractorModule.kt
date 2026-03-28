package com.tz01x.nmusic

import android.media.MediaMetadataRetriever
import android.util.Base64
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableNativeMap

class AlbumArtExtractorModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "AlbumArtExtractor"

    @ReactMethod
    fun getEmbeddedPicture(uri: String, promise: Promise) {
        try {
            val retriever = MediaMetadataRetriever()
            try {
                retriever.setDataSource(reactApplicationContext, android.net.Uri.parse(uri))

                val pictureBytes: ByteArray? = retriever.embeddedPicture

                if (pictureBytes != null && pictureBytes.isNotEmpty()) {
                    val base64 = Base64.encodeToString(pictureBytes, Base64.NO_WRAP)
                    val dataUri = "data:image/jpeg;base64,$base64"
                    promise.resolve(dataUri)
                } else {
                    promise.resolve(null)
                }
            } finally {
                retriever.release()
            }
        } catch (e: Exception) {
            promise.reject("ALBUM_ART_ERROR", "Failed to extract album art: ${e.message}", e)
        }
    }

    @ReactMethod
    fun getAllMetadata(uri: String, promise: Promise) {
        try {
            val retriever = MediaMetadataRetriever()
            try {
                retriever.setDataSource(reactApplicationContext, android.net.Uri.parse(uri))

                val metadata = WritableNativeMap()

                extractMetadata(retriever, MediaMetadataRetriever.METADATA_KEY_ALBUM)?.let {
                    metadata.putString("album", it)
                }
                extractMetadata(retriever, MediaMetadataRetriever.METADATA_KEY_ARTIST)?.let {
                    metadata.putString("artist", it)
                }
                extractMetadata(retriever, MediaMetadataRetriever.METADATA_KEY_TITLE)?.let {
                    metadata.putString("title", it)
                }
                extractMetadata(retriever, MediaMetadataRetriever.METADATA_KEY_ALBUMARTIST)?.let {
                    metadata.putString("albumArtist", it)
                }
                extractMetadata(retriever, MediaMetadataRetriever.METADATA_KEY_GENRE)?.let {
                    metadata.putString("genre", it)
                }
                extractMetadata(retriever, MediaMetadataRetriever.METADATA_KEY_YEAR)?.let {
                    metadata.putString("year", it)
                }
                extractMetadata(retriever, MediaMetadataRetriever.METADATA_KEY_CD_TRACK_NUMBER)?.let {
                    metadata.putString("trackNumber", it)
                }
                extractMetadata(retriever, MediaMetadataRetriever.METADATA_KEY_DURATION)?.let {
                    metadata.putString("duration", it)
                }

                val pictureBytes: ByteArray? = retriever.embeddedPicture
                if (pictureBytes != null && pictureBytes.isNotEmpty()) {
                    val base64 = Base64.encodeToString(pictureBytes, Base64.NO_WRAP)
                    metadata.putString("artworkUri", "data:image/jpeg;base64,$base64")
                } else {
                    metadata.putNull("artworkUri")
                }

                promise.resolve(metadata)
            } finally {
                retriever.release()
            }
        } catch (e: Exception) {
            promise.reject("METADATA_ERROR", "Failed to extract metadata: ${e.message}", e)
        }
    }

    private fun extractMetadata(retriever: MediaMetadataRetriever, key: Int): String? {
        return try {
            retriever.extractMetadata(key)
        } catch (e: Exception) {
            null
        }
    }
}
