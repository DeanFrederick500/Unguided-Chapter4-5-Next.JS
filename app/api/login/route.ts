import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL!, {
  ssl: "require",
});

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const users = await sql`

      SELECT
        id,
        name,
        email,
        role

      FROM users

      WHERE
        email = ${email}
        AND password = ${password}

    `;

    if (users.length === 0) {
      return Response.json(
        {
          success: false,
          message: "Email atau password salah",
        },
        {
          status: 401,
        }
      );
    }

    return Response.json({
      success: true,
      user: users[0],
    });

  } catch (error) {

    return Response.json(
      {
        success: false,
        error: String(error),
      },
      {
        status: 500,
      }
    );

  }
}