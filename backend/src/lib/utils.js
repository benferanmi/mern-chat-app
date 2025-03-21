import jwt from "jsonwebtoken"


export const generateToken = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" })

    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true, // prevents XSS attacts cross-site scripting attacks 
        secure: true,  // Required for cross-site cookies (must be on HTTPS)
        sameSite: "none", // CSFR attacks cross site request forgery attacks
    })

    return token
}