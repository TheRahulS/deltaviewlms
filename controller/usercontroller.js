const db = require('../config/db_Setting')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken')
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'rahulsoni7982@gmail.com',
        pass: 'fsga runm dxax fucq'
    }
});
const sendOTPByEmail = async(email, otp='') => {
    try {
        const mailOptions = {
            from: 'rahulsoni7982@gmail.com',
            to: email,
            subject: 'Your OTP for verification',
            text: `Your OTP (One-Time Password) for verification is: ${otp}`
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending email or storing OTP:', error);
        throw error;
    }
};
const generateOTP = () => {

    return Math.floor(100000 + Math.random() * 900000);
};

// SEND OTP API
const otpSend = async(req, res) => {
    const { email } = req.body;

    try {
        // Check if email is provided
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const existingEmail = await db.select('tblusers', 'email', `email = '${email}' AND username!='' `, true);
        if (existingEmail) {
            // Email already exists
            return res.status(400).json({ message: 'Email already exists' });
        }
        // Check if the email exists in the database
        const existingUser = await db.select('tblusers', '*', `email = '${email}'`, true);

        if (existingUser) { 

            const status = existingUser.status;

            if (status == 1) {
                // Status is 1, email is verified
                return res.status(200).json({ message: 'Your email is verified. Please proceed to the next step' });
            } else {
                // Status is 0, resend OTP
                const otp = generateOTP();
                await db.update('tblusers', { otp }, `email = '${email}'`);
                await sendOTPByEmail(email, otp);
                return res.status(200).json({ message: 'OTP resent successfully. Please check your email' });
            }
        } else {
            // Email does not exist, generate OTP and insert new row
            const otp = generateOTP();
            await db.insert('tblusers', { email, otp });
            await sendOTPByEmail(email, otp);
            return res.status(200).json({ message: 'OTP sent successfully. Please check your email' });
        }
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const resendOTP=async(req,res)=>{
    const {email}=req.body;
    const otp = generateOTP();
    await db.update('tblusers', { otp }, `email = '${email}'`);
    await sendOTPByEmail(email, otp);
    return res.status(200).json({ message: 'OTP resent successfully. Please check your email' });

}


// OTP VERIFY API
const verifyOtp = async(req, res) => {
    const { otp } = req.body;
    try {
        const result = await db.select('tblusers', '*', ` otp = '${otp}'`);
        if (result.length === 0) {
            return res.status(401).json({ error: 'Invalid OTP' });
        }

        // Update the status of the user to '1'
        await db.update('tblusers', { status: '1' }, `otp = '${otp}'`);

        res.status(200).json({ message: 'OTP verification successful' });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// SIGNUP API
const updateUser = async(req, res) => {
    try {
        const tbl_name = 'tblusers';
        const { email } = req.params;
        console.log(email);
        const { username, password, confirmPassword } = req.body;

        // Check if all fields are provided
        if (!username || !password || !confirmPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const usernameRegex = /^[a-zA-Z0-9]+$/;
        
        if (!usernameRegex.test(username)) {
            return res.status(400).json({ message: 'Invalid username. Only alphabets and numbers  are allowed' });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await db.select('tblusers', '*', `email = '${email}'`);

        if (!user || user.length === 0) {
            return res.status(404).json({ message: 'User not found in the database' });
        }

        const result = await db.update(tbl_name, { username, password: hashedPassword }, `email = '${email}'`);
        const userId = user.id;
        const token = jwt.sign({ userId, source: 'signup' }, 'kjhgfghj', );
        if (result.status) {
            const userid = user.id
            return res.status(200).json({
                status: true,
                affected_rows: result.affected_rows,
                token: token,
                userId: userid,
                message: "Data updated successfully",

            });
        } else {
            throw new Error("Failed to update data");
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to update data" });
    }
};

// GET ALL USER API
const getAllUser = async(req, res) => {
        const userfound = await db.selectAll('tblusers', '*', '', '');
        res.status(200).json({
            message: "data fetched successfully",
            userfound
        })
    }
    // SELECT CLASS API
const selectclass = async(req, res) => {
    const userId = req.userId
    const { name, phone, grade } = req.body;

    if (!name || !phone || !grade) {
        return res.status(400).json({ message: 'Name, phone, and grade are required fields' });
    }
       
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(name)) {
        return res.status(400).json({ message: 'Invalid name. Only alphabetic characters and spaces are allowed' });
    }
    const isValidGrade = Number(grade) >= 1 && Number(grade) <= 12;
        if (!isValidGrade) {
            return res.status(400).json({ message: 'Choose a correct grade between 1 and 12' });
        }
    const result = await db.update('tblusers', { name, phone, grade }, `id = '${userId}'`, true);

    if (result.status) {
        return res.status(200).json({
            status: result.status,
            affected_rows: result.affected_rows,
            info: result.info,
            message: "Data updated successfully"
        });
    } else {
        throw new Error("Failed to update data");
    }

};



// SELECT STREAM API
const selectstream = async(req, res) => {
    const userId = req.userId
    const { stream } = req.body;

    // Check if stream is provided
    if (!stream) {
        return res.status(400).json({ message: 'Stream is a required field' });
    }


    const result = await db.update('tblusers', { stream }, `id = '${userId}'`);

    if (result.status) {
        return res.status(200).json({
            status: result.status,
            affected_rows: result.affected_rows,
            info: result.info,
            message: "Data updated successfully"
        });
    } else {
        throw new Error("Failed to update data");
    }

};

// LOGIN CONTROLLER
const loginController = async(req, res) => {
    const { email, password } = req.body;
    console.log(req.session);
    try {
        // Fetch user from the database based on email
        const user = await db.select('tblusers', '*', `email='${email}'`);

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Compare the provided password with the hashed password stored in the database
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Incorrect password' });
        }

        // Store user ID in the session
        const token = jwt.sign({ userId: user.id, source: 'login' }, 'dfghjnhbgvf', { expiresIn: '7d' });

        // Redirect to a protected page or send a success response
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// LOGOUT CONTROLLER
// SINGLE USER API
const getUserProfile = async(req, res) => {
    try {
        // Retrieve user ID from request parameters
        const userId = req.userId;
        console.log('User ID:', userId);
        // Fetch user data based on the user ID
        let UserData = {};
        UserData = await db.select('tblusers', '*', `id = '${userId}'`, true);

        res.status(200).json({ UserData });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// UPDATE USERPROFILE API
const userProfile = async(req, res) => {
    const userId = req.userId
    const { name, phone, alternatephone, state, city, dob, school, address, gender } = req.body;
    if (!userId) {
        return res.status(401).json({ message: 'User ID not found' });
    }
    const result = await db.update('tblusers', { name, phone, alternatephone, city, dob, school, address, gender, state }, `id = '${userId}'`, true);
    if (result.status) {
        return res.status(200).json({
            status: result.status,
            affected_rows: result.affected_rows,
            info: result.info,
            message: "Data updated successfully"
        });
    } else {
        throw new Error("Failed to update data");
    }
};
// select board api
const selectboard = async(req, res) => {
    try {
        // Extract the token from the request headers
        const userId = req.userId;
        // Extract board from the request body
        console.log(userId)
        const { board } = req.body;
        // Check if board is provided
        if (!board) {
            return res.status(400).json({ message: 'Board is a required field' });
        }
        // Update the user's board in the database
        const result = await db.update('tblusers', { board }, `id = '${userId}'`, true);

        if (result.status) {
            return res.status(200).json({
                status: result.status,
                affected_rows: result.affected_rows,
                info: result.info,
                message: 'Data updated successfully'
            });
        } else {
            throw new Error('Failed to update data');
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update data' });
    }
};
// select language
const selectlanguage = async(req, res) => {
        try {
            const userId = req.userId;

            const { language } = req.body;

            if (!language) {
                return res.status(400).json({ message: 'language are required field' });
            }


            const result = await db.update('tblusers', { language }, `id = '${userId}'`, true);

            if (result.status) {
                return res.status(200).json({
                    status: result.status,
                    affected_rows: result.affected_rows,
                    info: result.info,
                    message: "Data updated successfully"
                });
            } else {
                throw new Error("Failed to update data");
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Failed to update data" });
        }
    }
    // update grade after login
const updategrade = async(req, res) => {

    const userId = req.userId;
    const { grade } = req.body;

    // Check if userId is available
    if (!userId) {
        return res.status(401).json({ message: 'User ID not found' });
    }
    const isValidGrade = Number(grade) >= 1 && Number(grade) <= 12;
        if (!isValidGrade) {
            return res.status(400).json({ message: 'Choose a correct grade between 1 and 12' });
        }

    if (parseInt(grade) >= 1 && parseInt(grade) <= 10) {
        // Update the stream column to null or an empty string
        const result = await db.update('tblusers', { grade, stream: null }, `id='${userId}'`, true);
        return handleUpdateResponse(result, res);
    } else {
        // If the grade is not within the range of 1 to 10, update only the grade
        const result = await db.update('tblusers', { grade }, `id='${userId}'`, true);
        return handleUpdateResponse(result, res);
    }

};

// Function to handle update response
const handleUpdateResponse = (result, res) => {
    if (result.status) {
        return res.status(200).json({
            status: result.status,
            affected_rows: result.affected_rows,
            info: result.info,
            message: "Data updated successfully"
        });
    } else {
        throw new Error("Failed to update data");
    }
};




// update STREAM after login
const updatestream = async(req, res) => {

    const userId = req.userId
    const { stream } = req.body;

    // Check if userId is available
    if (!userId) {
        return res.status(401).json({ message: 'User ID not found' });
    }

    const result = await db.update('tblusers', { stream }, `id='${userId}'`, true);

    return handleResponse(result, res);

};

// Function to handle update response
const handleResponse = (result, res) => {
    if (result.status) {
        return res.status(200).json({
            status: result.status,
            affected_rows: result.affected_rows,
            info: result.info,
            message: "Data updated successfully"
        });
    } else {
        throw new Error("Failed to update data");
    }
};


// get subject api to fetch the subject
const getsubject = async(req, res) => {
    const userId = req.userId;

    const user = await db.select('tblusers', '*', `id='${userId}'`, true);
    const grade = user.grade;
    const query = `
        SELECT DISTINCT tbl_subjects.subject_name, tbl_subjects.id, tbl_subject_logo.subject_logo
        FROM tblusers 
        LEFT JOIN tbl_subjects ON tblusers.grade = tbl_subjects.class_id
        LEFT JOIN tbl_subject_logo ON tbl_subjects.logo_id = tbl_subject_logo.id 
        WHERE tblusers.grade = ${grade} AND tblusers.id = ${userId} AND  (tblusers.stream = tbl_subjects.stream_id OR tbl_subjects.subject_name IN ('English Grammar', 'Sanskrit', 'Computer Science', 'Informatics Practice', 'हिन्दी साहित्य', 'हिन्दी व्याकरण', 'संस्कृत'));
      `;
    const result = await db.queryAll(query, true);

    res.status(200).json({
        message: "data fetched successfully",
        result
    });

};
// get videos of particular subject
const getvideos = async (req, res) => {
    const userId = req.userId;
    const id = req.params.id;
    const videoQuery = `
      SELECT DISTINCT tbl_videos.*
      FROM tbl_videos
      LEFT JOIN tbl_subjects ON tbl_videos.subject_id = tbl_subjects.id
      WHERE tbl_subjects.id = '${id}';
    `;
    const video_total = `
    SELECT COUNT(DISTINCT tbl_videos.chapter_id) AS chapter_count
    FROM tbl_videos
    LEFT JOIN tbl_subjects ON tbl_videos.subject_id = tbl_subjects.id
    WHERE tbl_subjects.id = '${id}';
    `;
    const videos = await db.queryAll(videoQuery, true);
    const video_count = await db.queryAll(video_total, true);
    // Check if videos exist
    if (!videos || videos.length === 0) {
        return res.status(404).json({ error: "No videos found for this subject" });
    }
    // Fetch the user's subscription status from the database
    const userSubscriptionStatus = await db.queryAll(
        `SELECT issubscribed FROM tblusers WHERE id = '${userId}'`
    );
    let playL = video_count[0].chapter_count;
    let playLimit = 3;
    let videoTitles = [];
    let chapterTitles = [];
    if (userSubscriptionStatus.length > 0 && userSubscriptionStatus[0].issubscribed === '1') {
        playLimit = videos.length; // Set limit to all videos for subscribed users
    } else {
        // Update the first 3 videos' URLs to their original values
        for (let i = 0; i < 3 && i < videos.length; i++) {
            videoTitles.push(videos[i].video_title);
            chapterTitles.push(videos[i].chapter_title);
        }
        // Update URLs for remaining videos with custom dynamic URL
        for (let i = 3; i < videos.length; i++) {
            videos[i].url = "";
        }
        playLimit = videos.length
    }
    console.log(playLimit);
    res.status(200).json({
        message: "Data fetched successfully",
        videos: videos.slice(0, playLimit),
        videoTitles: videoTitles,
        chapterTitles: chapterTitles,
        playLimit,
        playL
    });
};


// const getvideos = async(req, res) => {
//     const userId = req.userId;

//     // Fetch the subject query from the request parameters or query string
//     const id = req.params.id;

//     // Query to get videos based on subject ID
//     const videoQuery = `
//       SELECT DISTINCT tbl_videos.*
//       FROM tbl_videos

//       WHERE tbl_videos.subject_id = '${id}';
//     `;

//     const videos = await db.queryAll(videoQuery, true);

//     // Check if videos exist
//     if (!videos || videos.length === 0) {
//         return res.status(404).json({ error: "No videos found for this subject" });
//     }

//     // Fetch the user's subscription status from the database
//     const userSubscriptionStatus = await db.queryAll(
//         `SELECT issubscribed FROM tblusers WHERE id = '${userId}'`

//     );

//     // Set the play limit based on the user's subscription status
//     const playLimit = userSubscriptionStatus.issubscribed == '1' ? videos.length : 3;
//     console.log(playLimit)

//     // Handle the results, either send them as response or process further
//     res.status(200).json({
//         message: "Data fetched successfully",
//         videos,
//         playLimit,
//     });
// };

// subscription api
const updatesubscription = async (req, res) => {
    const userId = req.userId;
    if (!userId) {
        return res.status(404).json({ message: "user not found in database" });
    }

    // Calculate the current date and the expiry date for one month from the current date
    const currentDate = new Date().toISOString();
    const oneMonthLater = new Date();
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
    const expiryDate = oneMonthLater.toISOString();

    try {
        // Update the user's subscription status and store the subscription dates
        const result = await db.update('tblusers', {
            issubscribed: '1',
            subscriptionStartDate: currentDate,
            subscriptionExpiryDate: expiryDate
        }, `id='${userId}'`);

        if (!result) {
            return res.status(500).json({ message: "failed to update subscription" });
        }

        res.status(200).json({
            message: "data updated successfully",
            result
        });
    } catch (error) {
        console.error('Error updating subscription:', error);
        res.status(500).json({ message: "an error occurred while updating subscription" });
    }
};
// expire subscription api
const checkExpiredSubscriptions = async (req, res) => {
    try {
        // Get the current date
        const currentDate = new Date();
        const userId = req.userId;

        // Query the database to get the user's subscription expiration date
        const user = await db.select('tblusers', '*', `id='${userId}' `, true);

        if (!user || user.length === 0) {
            return res.status(404).json({ message: "user not found" });
        }

        const subscriptionExpiryDate = new Date(user.subscriptionExpiryDate);
        console.log(subscriptionExpiryDate);

        if (subscriptionExpiryDate < currentDate) {
            // Update the subscription status to '0' (expired)
            await db.update('tblusers', {
                issubscribed: '0'
            }, `id='${userId}'`);

            return res.status(200).json({
                message: "subscription has expired",
                userId
            });
        }

        res.status(200).json({
            message: "subscription is active",
            userId,
            subscriptionExpiryDate: subscriptionExpiryDate.toISOString()
        });

    } catch (error) {
        console.error('Error checking subscription status:', error);
        res.status(500).json({ message: "an error occurred while checking subscription status" });
    }
};

module.exports = { otpSend, verifyOtp, updateUser, getAllUser, selectclass, updatestream, selectstream, loginController, getUserProfile, userProfile, getsubject, selectboard, getvideos, selectlanguage, updategrade,updatesubscription,checkExpiredSubscriptions,resendOTP }