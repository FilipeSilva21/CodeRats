package com.devrats

import com.devrats.di.appModule
import com.devrats.plugins.*
import io.ktor.server.application.*
import io.ktor.server.netty.*
import org.koin.ktor.plugin.Koin
import org.koin.logger.slf4jLogger

fun main(args: Array<String>): Unit = io.ktor.server.netty.EngineMain.main(args)

fun Application.module() {
    install(Koin) {
        slf4jLogger()
        modules(appModule(environment))
    }

    configureSerialization()
    configureCORS()
    configureAuthentication()
    configureWebSockets()
    configureDatabase()
    configureRouting()
}
