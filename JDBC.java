import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class DummyJDBC {
    public static void main(String[] args) {
        try {
            // Load JDBC driver (dummy)
            Class.forName("com.mysql.cj.jdbc.Driver");

            // Connect to database (dummy URL, username, password)
            Connection conn = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/eduTasksDB", "username", "password"
            );

            // Create a statement
            Statement stmt = conn.createStatement();

            // Execute a query (dummy)
            ResultSet rs = stmt.executeQuery("SELECT * FROM tasks");

            // Print dummy results
            while (rs.next()) {
                System.out.println("Task: " + rs.getString("title") +
                                   ", Subject: " + rs.getString("subject") +
                                   ", Deadline: " + rs.getString("deadline"));
            }

            // Close connections
            rs.close();
            stmt.close();
            conn.close();

            System.out.println("Dummy JDBC executed successfully!");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
