import java.time.LocalDate
import java.time.temporal.ChronoUnit

fun main() {
    val lastCommit = "2026-05-03"
    val today = LocalDate.now()
    val lastDate = LocalDate.parse(lastCommit)
    val daysBetween = ChronoUnit.DAYS.between(lastDate, today)
    println("Today: $today")
    println("LastDate: $lastDate")
    println("Days Between: $daysBetween")
    println("Effective Streak: ${if (daysBetween <= 1) 2 else 0}")
}
