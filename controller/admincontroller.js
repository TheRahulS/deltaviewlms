const db = require('../config/db_Setting')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const AdminLogin = async(req, res) => {
    const { username, password } = req.body;
    
    try {
        // Fetch user from the database based on email
        const user = await db.select('tbl_admin', '*', `username='${username}'`,true);
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Incorrect password' });
        }

        const token = jwt.sign({ userId: user.id }, 'dfghjnhbgdsdsdvf', { expiresIn: '7d' });
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
const getAllUser = async (req, res) => {
    try {
        // Fetch all users
        const allUsers = await db.selectAll('tblusers', '*', '');

        const userCount = allUsers.length;

        res.status(200).json({
            message: "Data fetched successfully",
            userCount: userCount,
            allUsers: allUsers
        });
    } catch (error) {
       
        res.status(500).json({
            message: "Error fetching users",
            error: error.message
        });
    }
}
const getAllNotSubscriptionUser=async(req,res)=>{
    const userfound=await db.selectAll('tblusers','*',`issubscribed='0'`)
    const usercount=userfound.length;
    res.status(200).json({
        message:"data fetch successfully",
        userfound,
        usercount
    })
}

const getAllSubscriptionUser=async(req,res)=>{
    const userfound=await db.selectAll('tblusers','*',`issubscribed='1'`)
    const userscount=userfound.length;
    res.status(200).json({
        message:"data fetch successfully",
        userscount
    })
}
const content=async(req,res)=>{
    const {video_title,subject_id,subject_title,chapter_title,chapter_id,class_id,url}=req.body
    if(!video_title || !subject_id || !subject_title || !chapter_title || !chapter_id || !class_id || !url){
        res.status(400).json({
            message:"all field are required"
        })
    }

    await db.insert('tbl_videos',{video_title,subject_id,subject_title,chapter_title,chapter_id,class_id,url},true)

    res.status(200).json({
        message:"data inserted successfully"
    })
}
const books=async(req,res)=>{
    const {books_name,book_url,class_id,subject_id}=req.body;
    if(!books_name || !book_url || !class_id ||!subject_id){
        res.status(400).json({
            message:"all fields are required"
        })
    }
    await db.insert('tbl_books',{books_name,book_url,class_id,subject_id})
    res.status(200).json({
        message:"books inserted successfully"
    })
}
function generateRandomCode() {
    const currentDate = new Date();
    const year = currentDate.getFullYear().toString().slice(-2);
    const date = currentDate.getDate().toString().padStart(2, '0');
    let hour = currentDate.getHours().toString().padStart(2, '0');
    const minute = currentDate.getMinutes().toString().padStart(2, '0');
    const second = currentDate.getSeconds().toString().padStart(2, '0');
    const randomCode = `DV${year}${date}${hour}${minute}${second}`;
    return randomCode;
}
async function updateLicenseCode(id) {
    const randomCode = generateRandomCode();
    await db.update('tbl_license', { appcode: randomCode }, `id=${id}`);
    await db.insert('tbl_device_license',{appcode:randomCode,license_id:id})
}

const License = async (req, res) => {
    const { name, phoneno, email, organisation, content, board, medium, duration } = req.body;
    if (!name || !phoneno || !email || !organisation || !content || !board || !medium || !duration) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    const userFound = await db.select('tbl_license', '*', `email='${email}'`, true);
    if (userFound) {
        return res.status(400).json({ message: 'Email already exists' });
    } else {
        try {
            
            const insertResult = await db.insert('tbl_license', { name, phoneno, email, organisation, content, board, medium, duration }, true);
            if (insertResult.status && insertResult.insert_id) {
                const lastInsertedId = insertResult.insert_id;
                await updateLicenseCode(lastInsertedId);
                return res.status(200).json({ message: 'License created successfully', lastInsertedId });
            } else {
                return res.status(500).json({ message: 'Error inserting license' });
            }
        } catch (error) {
            console.error('Error creating license:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }

    }
}

const getProfile = async (req, res) => {
    const id = req.params.id;
    console.log(id)
    const user = await db.select('tblusers', '*', `id='${id}'`, true);
    console.log(user)
    if (user) {
        await res.status(200).json({
            message: "data profile fetched successfully",
            user
        });
    } else {
        await res.status(404).json({
            message: "User not found"
        });
    }
}

module.exports={AdminLogin,getAllUser,getAllNotSubscriptionUser,getAllSubscriptionUser,content,books,License,getProfile}