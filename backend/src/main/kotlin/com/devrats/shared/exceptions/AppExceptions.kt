package com.devrats.shared.exceptions

open class AppException(override val message: String, val statusCode: Int = 500) : RuntimeException(message)

class NotFoundException(message: String = "Resource not found") : AppException(message, 404)
class UnauthorizedException(message: String = "Unauthorized") : AppException(message, 401)
class ForbiddenException(message: String = "Forbidden") : AppException(message, 403)
class BadRequestException(message: String = "Bad request") : AppException(message, 400)
class ConflictException(message: String = "Conflict") : AppException(message, 409)
