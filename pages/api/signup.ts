import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import cookies from "cookies";
import prisma from "../../lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

const signup = async (req: NextApiRequest, res: NextApiResponse) => {
    const salt = bcrypt.genSaltSync();
    const { email, password } = req.body;
    let user;
    try {
        user = await prisma.user.create({
            data: {
                name: "",
                email,
                password: bcrypt.hashSync(password, salt),
            },
        });
    } catch (e) {
        res.status(401);
        res.json({ error: "User already exists." });
        return;
    }
    const token = jwt.sign(
        { email: user.email, id: user.id, time: Date.now() },
        "hello",
        {
            expiresIn: "8h",
        }
    );
    res.setHeader(
        "Set-Cookie",
        cookie.serialize("KM_ACCESS_TOKEN", token, {
            httpOnly: true,
            maxAge: 8 * 60 * 60,
            path: "/",
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
        })
    );
    res.json({ user })
};

export default signup;
