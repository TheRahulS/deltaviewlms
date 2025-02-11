const jwt = require('jsonwebtoken');
const db = require('../config/db_Setting');
const secretKey = process.env.SECRET_KEY || 'dsffsddfsdddsddfsd'; // Use environment variable for secret key

const login = async (req, res) => {
    const { appcode, uniqueid } = req.body; // Changed deviceid to uniqueid
    try {
        // Check if the appcode exists
        const existingAppcode = await db.select('tbl_devices_license', '*', `appcode='${appcode}'`, true);
        if (!existingAppcode) {
            return res.status(400).json({
                status: false,
                message: "License is not valid"
            });
        }
        const userUniqueId = existingAppcode.uniqueid; // Assuming the existing record has a uniqueid field
        if (userUniqueId && uniqueid !== userUniqueId) {
            return res.status(400).json({
                status: false,
                message: "License already consumed"
            });
        }

        const registeredOn = new Date();

        if (uniqueid) {
            const existingDevice = await db.select('tbl_devices_license', '*', `uniqueid='${uniqueid}'`, true);
            if (existingDevice) {
                // Generate a token for the existing device
                const payload = {
                    appcode,
                    uniqueid,
                    registeredOn: existingDevice.Registerd_on
                };
                const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });
                return res.status(200).json({
                    status: true,
                    message: "Unique ID already exists",
                    token: token // Send the token in the response
                });
            }

            // Update the license record with the new uniqueid and registration date.
            await db.update('tbl_devices_license', { uniqueid, Registerd_on: registeredOn }, `appcode='${appcode}'`, true);

          
        } else {
            return res.status(400).json({
                status: false,
                message: "Unique ID is required"
            });
        }

        // Generate a new token for the new unique ID registration
        const payload = {
            appcode,
            uniqueid,
            
            
            registeredOn: registeredOn
        };
        const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });
        const data= await db.select('tbl_devices_license',"*",`appcode='${appcode}'`,true)
        const time = data.Time_Period;
        console.log(data)
        return res.status(200).json({
            status: true,
            message: "Device license updated successfully",
            token: token, // Send the token in the response,
            data:payload,
            timedata:time
            
        });

    } catch (error) {
        console.error('Error updating device license:', error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

module.exports = login;
