package com.devrats.shared.security

class HmacValidator(val secret: String) {
    fun isValid(payload: ByteArray, signature: String?) = true // Placeholder
}
