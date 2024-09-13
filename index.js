const express = require('express');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2');

const app = express();
const cors = require("cors");
const corsConfig = {
    origin: "*",
    Credential: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
};
app.options("", cors(corsConfig));
app.use(cors(corsConfig));
app.use(express.json());
const PORT = 3600;

// MySQL database connection configuration
const db = mysql.createConnection({
    host: '202.28.34.197',
    user: 'web66_65011212021',       // Replace with your MySQL username
    password: '65011212021@csmsu', // Replace with your MySQL password
    database: 'web66_65011212021' // Replace with your MySQL database name
});

// Connect to MySQL
db.connect(err => {
    if (err) {
        console.error('Could not connect to MySQL:', err);
    } else {
        console.log('Connected to MySQL');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.get('/about', (req, res) => {
    res.send('This is my about route');
});

// New route to fetch data from MySQL
app.get('/users', (req, res) => {
    const sql = 'SELECT * FROM members'; // Replace 'users' with your table name
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            res.status(500).send('An error occurred while fetching data.');
        } else {
            res.json(results); // Send the results as a JSON response
        }
    });
});

// เส้นทางใหม่สำหรับดึงโปรไฟล์ผู้ใช้
app.get('/getUserProfile/:member_id', (req, res) => {
    const memberId = req.params.member_id;
  
    const sqlSelect = "SELECT * FROM members WHERE member_id = ?";
    db.query(sqlSelect, [memberId], (err, results) => {
      if (err) {
        console.error('Error fetching user profile:', err);
        return res.status(500).send('Error fetching user profile');
      }
  
      if (results.length > 0) {
        res.json(results[0]);
      } else {
        res.status(404).send('User not found');
      }
    });
  });  


app.post('/register', (req, res) => {
    const { name, email, username, password, phone, money } = req.body; // Accessing all parameters from the request body

    // Check if any required field is missing
    if (!name || !email || !username || !password || !phone || !money) {
        return res.status(400).send('All fields (name, email, username, password, phone, money) are required');
    }

    // SQL query with placeholders
    const sql = 'INSERT INTO members (name, email, username, password, phone, money) VALUES (?, ?, ?, ?, ?, ?)';

    // Execute the query with values
    db.query(sql, [name, email, username, password, phone, money], (err, results) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).send('An error occurred while inserting data.');
        }

        res.status(201).send('User registered successfully');
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body; // การเข้าถึงพารามิเตอร์จาก request body

    // ตรวจสอบว่ามีฟิลด์ที่ต้องการหายไปหรือไม่
    if (!username || !password) {
        return res.status(400).send('กรุณากรอกข้อมูลให้ครบทุกช่อง (username และ password)');
    }

    // SQL query เพื่อทำการตรวจสอบผู้ใช้
    const sql = 'SELECT * FROM members WHERE username = ? AND password = ?';

    // การดำเนินการ query โดยใช้ค่า
    db.query(sql, [username, password], (err, results) => {
        if (err) {
            console.error('เกิดข้อผิดพลาดในการสอบถามข้อมูล:', err);
            return res.status(500).send('เกิดข้อผิดพลาดขณะสอบถามข้อมูล.');
        }

        if (results.length > 0) {
            res.json({
                message: 'เข้าสู่ระบบสำเร็จ',
                data: results[0] // ส่งเฉพาะข้อมูลผู้ใช้ที่ตรงกัน
            });
        } else {
            res.status(401).send('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        }
    });
});

app.post('/forget_password', (req, res) => {
    const { username, email, phone, new_password } = req.body; // การเข้าถึงพารามิเตอร์จาก request body

    // ตรวจสอบว่ามีฟิลด์ที่ต้องการหายไปหรือไม่
    if (!username || !email || !phone || !new_password) {
        return res.status(400).send('กรุณากรอกข้อมูลให้ครบทุกช่อง (username และ password)');
    }

    // SQL query เพื่อทำการตรวจสอบผู้ใช้
    const sql = 'SELECT * FROM members WHERE username = ? AND email = ? AND phone = ?';

    // การดำเนินการ query โดยใช้ค่า
    db.query(sql, [username, email, phone], (err, results) => {
        if (err) {
            console.error('เกิดข้อผิดพลาดในการสอบถามข้อมูล:', err);
            return res.status(500).send('เกิดข้อผิดพลาดขณะสอบถามข้อมูล.');
        }

        if (results.length > 0) {
            const sql = 'UPDATE members SET password = ?';
            db.query(sql, [new_password], (err, results) => {
                if (err) {
                    console.error('เกิดข้อผิดพลาดในการอัปเดตข้อมูล:', err);
                    return res.status(500).send('เกิดข้อผิดพลาดขณะอัปเดตข้อมูล.');
                }
        
                if (results.affectedRows > 0) {
                    res.status(200).send('อัปเดตรหัสผ่านสำเร็จ');
                } else {
                    res.status(404).send('ไม่พบผู้ใช้ที่ต้องการอัปเดต');
                }
            });
        } else {
            res.status(401).send('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        }
    });
});


//admin ออก lotto แบบกำหนดใบ
app.get('/randomLotto', (req, res) => {
    const numberOfSets = parseInt(req.query.count) || 100; // จำนวนชุดที่ต้องการสุ่ม (ค่าเริ่มต้นคือ 100)
    const sqlSelect = "SELECT lotto_number FROM lotto"; // คำสั่ง SQL สำหรับดึงเลขที่มีอยู่
    const sqlInsert = "INSERT INTO lotto (lotto_number) VALUES ?"; // คำสั่ง SQL สำหรับแทรกข้อมูล

    // Step 1: ดึงเลขที่มีอยู่ในฐานข้อมูล
    db.query(sqlSelect, (err, results) => {
        if (err) {
            console.error('Error fetching existing lotto numbers:', err);
            return res.status(500).send('An error occurred while fetching existing lotto numbers.');
        }

        const existingLottoNumbers = new Set(results.map(row => row.lotto_number));
        const lottoNumbers = new Set();

        // สุ่มเลข 6 หลักที่ไม่ซ้ำกับเลขที่มีอยู่
        while (lottoNumbers.size < numberOfSets) {
            const randomNumber = Math.floor(100000 + Math.random() * 900000).toString();

            // ตรวจสอบว่าเลขนี้ซ้ำกับเลขที่มีอยู่หรือไม่
            if (!existingLottoNumbers.has(randomNumber)) {
                lottoNumbers.add(randomNumber);
            }
        }

        const lottoArray = Array.from(lottoNumbers).map(number => [number]);

        //  บันทึกเลขที่สุ่มได้ลงในตาราง
        db.query(sqlInsert, [lottoArray], (err, insertResults) => {
            if (err) {
                console.error('Error inserting data:', err);
                return res.status(500).send('An error occurred while inserting data.');
            }

            res.json({ message: 'Lotto numbers generated and stored successfully.', insertedCount: insertResults.affectedRows });
        });
    });
});



//ค้นหาlotto
//ex. /searchLotto?number=123
app.get('/searchLotto', (req, res) => {
    const lottoNumber = req.query.number || ''; // รับหมายเลขล็อตโต้ที่ต้องการค้นหาจาก query parameter (ค่าเริ่มต้นเป็น empty string)

    // แบ่งหมายเลขล็อตโต้ออกเป็นตัวเลขย่อย
    const searchTerms = lottoNumber.split('').map(num => `%${num}%`);
    
    // สร้างคำสั่ง SQL และ array สำหรับค่าพารามิเตอร์
    let sqlSearch = "SELECT * FROM lotto WHERE status = 1";
    let sqlParams = [];
    
    // เพิ่มเงื่อนไขการค้นหาให้กับคำสั่ง SQL
    if (searchTerms.length > 0) {
        sqlSearch += ' AND (' + searchTerms.map((_, i) => `lotto_number LIKE ?`).join(' AND ') + ')';
        sqlParams = searchTerms;
    }

    db.query(sqlSearch, sqlParams, (err, results) => {
        if (err) {
            console.error('Error searching for lotto number:', err);
            res.status(500).send('An error occurred while searching for the lotto number.');
        } else if (results.length > 0) {
            res.json(results); // ส่งผลลัพธ์ JSON 
        }
    });
});


//เลขลงตะกร้า
app.post('/Add_to_basket', (req, res) => {
    const { member_id, lotto_id, lotto_number } = req.body;

    const sqlInsert = "INSERT INTO basket (member_id, lotto_id, lotto_number, price) VALUES (?, ?, ?, 80)";

    db.query(sqlInsert, [member_id, lotto_id, lotto_number], (err, results) => {
        if (err) {
            console.error('Error inserting data:', err);
            res.status(500).send('An error occurred while adding to the basket.');
        } else {
            res.json({ message: 'Lotto added to basket successfully.',results});
        }
    });
});


//SELECT เลขในตะกร้า ของแต่ละคน 
app.get('/My_basket/:member_id', (req, res) => {
    const member_id = req.params.member_id; 
    const sqlSelect = `
        SELECT basket.*, lotto.status 
        FROM basket 
        JOIN lotto ON basket.lotto_id = lotto.lotto_id 
        WHERE basket.member_id = ? AND lotto.status = 1
    `;

    db.query(sqlSelect, [member_id], (err, results) => {
        if (err) {
            console.error('Error searching for basket:', err);
            res.status(500).send('An error occurred while searching for the basket.');
        } else if (results.length > 0) {
            res.json(results);
        } else {
            res.json({ message: 'Empty basket.' });
        }
    });
});


// SELECT เลขที่ซื้อแล้ว ของแต่ละคน 
app.get('/My_buyLotto/:member_id', (req, res) => {
    const member_id = req.params.member_id; 
    const sqlSelect = "SELECT * FROM buy WHERE member_id = ?"; 

    db.query(sqlSelect, [member_id], (err, results) => {
        if (err) {
            console.error('Error searching for basket:', err);
            res.status(500).send('An error occurred while searching for the basket.');
        } else if (results.length > 0) {
            res.json(results);
        } else {
            res.json({ message: 'Empty basket.' });
        }
    });
});

// app.post('/buy', (req, res) => {
//     const { name, lotto_number } = req.body;
//     const sqlMem = "SELECT member_id,money FROM members WHERE name = ?";
//     db.query(sqlMem, [name], (err, results) => {
//         if (err) {
//             console.error('Error searching for member:', err);
//             res.status(500).send('An error occurred while searching for the member.');
//         } else if (results.length > 0) {
//             const sqllotto = "SELECT lotto_id,lotto_number FROM lotto WHERE lotto_number = ?";
//             db.query(sqllotto, [lotto_number], (err, results) => {
//                 if (err) {
//                     console.error('Error searching for lotto:', err);
//                     res.status(500).send('An error occurred while searching for the lotto.');
//                 } else if (results.length > 0) {
//                     const sqlmoney = "SELECT lotto_id,lotto_number FROM lotto WHERE lotto_number = ?";
//                     db.query(sqllotto, [lotto_number], (err, results) => {
//                         if (err) {
//                             console.error('Error searching for lotto:', err);
//                             res.status(500).send('An error occurred while searching for the lotto.');
//                         } else if (results.length > 0) {
//                             res.json({ message: 'All Lotto numbers in the lotto.', data: results });
//                         } else {
//                             res.json({ message: 'Empty lotto.' });
//                         }
//                     });
//                 } else {
//                     res.json({ message: 'Empty lotto.' });
//                 }
//             });
//         } else {
//             res.json({ message: 'Empty basket.' });
//         }
//     });

// });


app.post('/buy', (req, res) => {
    const { member_id, lotto_id } = req.body;

    // ตรวจสอบสมาชิก และ select เอาเงินสมาชิกออกมา
    const sqlMem = "SELECT member_id, money FROM members WHERE member_id = ?";
    db.query(sqlMem, [member_id], (err, memberResults) => {
        if (err) {
            console.error('Error searching for member:', err);
            return res.status(500).send('An error occurred while searching for the member.');
        }

        if (memberResults.length > 0) {
            const member = memberResults[0];
            const memberMoney = member.money;
            const lottoPrice = 80; // ตั้งราคาเป็น 80 บาทตามที่กำหนด

            console.log(memberMoney);
            console.log(lottoPrice);

            // เปรียบเทียบเงินกับราคา
            if (memberMoney >= lottoPrice) {
                // เงินเพียงพอ ทำการซื้อ
                // ตรวจสอบข้อมูลล็อตเตอรี่
                const sqlLotto = "SELECT lotto_number FROM basket WHERE lotto_id = ? AND member_id = ?";
                db.query(sqlLotto, [lotto_id,member_id], (err, lottoResults) => {
                    if (err) {
                        console.error('Error searching for lotto number:', err);
                        return res.status(500).send('An error occurred while searching for the lotto number.');
                    }

                    if (lottoResults.length > 0) {
                        const lotto = lottoResults[0].lotto_number;

                        // คำสั่ง SQL สำหรับการซื้อ
                        const sqlInsert = "INSERT INTO buy (member_id, lotto_id, lotto_number, price, date_buy) VALUES (?, ?, ?, ?, NOW())";
                        db.query(sqlInsert, [member_id, lotto_id, lotto, lottoPrice], (err, insertResults) => {
                            if (err) {
                                console.error('Error inserting buy record:', err);
                                return res.status(500).send('An error occurred while processing the purchase.');
                            }

                            // ลดเงินของสมาชิก 80 บาท
                            const sqlUpdateMoney = "UPDATE members SET money = money - ? WHERE member_id = ?";
                            db.query(sqlUpdateMoney, [lottoPrice, member_id], (err, updateResults) => {
                                if (err) {
                                    console.error('Error updating member money:', err);
                                    return res.status(500).send('An error occurred while updating the member\'s money.');
                                }

                                // ลบข้อมูลล็อตเตอรี่จากตาราง basket
                                const sqlDeleteBasket = "DELETE FROM basket WHERE member_id = ? AND lotto_id = ?";
                                db.query(sqlDeleteBasket, [member_id, lotto_id], (err, deleteResults) => {
                                    if (err) {
                                        console.error('Error deleting from basket:', err);
                                        return res.status(500).send('An error occurred while deleting the item from basket.');
                                    }

                                    // อัพเดทสถานะล็อตโต้เป็น 0
                                    const sqlUpdateStatus = "UPDATE lotto SET status = 0 WHERE lotto_id = ?";
                                    db.query(sqlUpdateStatus, [lotto_id], (err, upResults) => {
                                        if (err) {
                                            console.error('Error updating lotto status:', err);
                                            return res.status(500).send('An error occurred while updating the lotto status.');
                                        }

                                        res.json({ message: 'successful' });
                                    });
                                });
                            });
                        });
                    } else {
                        res.status(404).send('Lotto number not found.');
                    }
                });
            } else {
                res.status(400).send('Insufficient funds.');
            }
        } else {
            res.status(404).send('Member not found.');
        }
    });
});


//lotto ทั้งหมด
app.get('/get_Lotto', (req, res) => {
    const sql = 'SELECT * FROM lotto'; // ดึงข้อมูลทั้งหมดจากตาราง lotto
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            res.status(500).send('An error occurred while fetching data.'); // แจ้ง error กรณีเกิดปัญหา
        } else {
            res.json(results); // ส่งผลลัพธ์กลับในรูปแบบ JSON
        }
    });
});


//lottoที่ยังไม่ขาย
app.get('/get_Lotto_status1', (req, res) => {
    const sql = 'SELECT * FROM lotto where status = 1'; // ดึงข้อมูลทั้งหมดจากตาราง lotto
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            res.status(500).send('An error occurred while fetching data.'); // แจ้ง error กรณีเกิดปัญหา
        } else {
            res.json(results); // ส่งผลลัพธ์กลับในรูปแบบ JSON
        }
    });
});

//ลบ lotto ออกจากตระกร้า
app.delete('/removeLottoFromBasket', (req, res) => {
    const { lotto_id, member_id } = req.body; // รับข้อมูลจาก body ของคำขอ

    if (!lotto_id || !member_id) {
        return res.status(400).send('หมายเลขล็อตโต้และ member ID ต้องถูกระบุ');
    }

    // คำสั่ง SQL สำหรับลบล็อตโต้จากตะกร้า
    const sqlDelete = "DELETE FROM basket WHERE lotto_id = ? AND member_id = ?";

    db.query(sqlDelete, [lotto_id, member_id], (err, results) => {
        if (err) {
            console.error('Error removing lotto from basket:', err);
            return res.status(500).send('เกิดข้อผิดพลาดในการลบล็อตโต้จากตะกร้า');
        }

        // ตรวจสอบว่ามีการลบแถวหรือไม่
        if (results.affectedRows > 0) {
            res.send('ล็อตโต้ถูกลบออกจากตะกร้าเรียบร้อยแล้ว');
        } else {
            res.status(404).send('ไม่พบล็อตโต้ในตะกร้าสำหรับสมาชิกที่ระบุ');
        }
    });
});

//เติมเงิน
app.post('/addWallet', (req, res) => {
    const { member_id, amount } = req.body;

    // ตรวจสอบว่ามีข้อมูลที่ต้องการครบหรือไม่
    if (!member_id || !amount) {
        return res.status(400).send('Member ID และจำนวนเงินต้องถูกระบุ');
    }

    // select เงินเดิม
    const sqlSelect = "SELECT money FROM members WHERE member_id = ?";
    db.query(sqlSelect, [member_id], (err, memberResults) => {
        if (err) {
            console.error('Error selecting member money:', err);
            return res.status(500).send('เกิดข้อผิดพลาดในการค้นหายอดเงินของสมาชิก');
        }

        if (memberResults.length > 0) {
            const currentMoney = memberResults[0].money;

            // บวกจำนวนเงินใหม่
            const updatedMoney = currentMoney + amount;

            //อัปเดทยอดเงินของสมาชิก
            const sqlUpdate = "UPDATE members SET money = ? WHERE member_id = ?";
            db.query(sqlUpdate, [updatedMoney, member_id], (err, updateResults) => {
                if (err) {
                    console.error('Error updating member money:', err);
                    return res.status(500).send('เกิดข้อผิดพลาดในการอัปเดทยอดเงินของสมาชิก');
                }

                res.json({ message: 'ยอดเงินถูกเพิ่มเรียบร้อยแล้ว', updatedMoney });
            });
        } else {
            res.status(404).send('ไม่พบสมาชิกที่ระบุ');
        }
    });
});


//ถอนเงิน 
app.post('/Withdraw_money', (req, res) => {
    const { member_id, amount } = req.body;

    // ตรวจสอบว่ามีข้อมูลที่ต้องการครบหรือไม่
    if (!member_id || !amount) {
        return res.status(400).send('Member ID และจำนวนเงินต้องถูกระบุ');
    }

    // select เงินเดิม
    const sqlSelect = "SELECT money FROM members WHERE member_id = ?";
    db.query(sqlSelect, [member_id], (err, memberResults) => {
        if (err) {
            console.error('Error selecting member money:', err);
            return res.status(500).send('เกิดข้อผิดพลาดในการค้นหายอดเงินของสมาชิก');
        }

        if (memberResults.length > 0) {
            const currentMoney = memberResults[0].money;
            
            // ถ้าเงินมี >= 100 ค่อยถอนได้
            if (currentMoney >= 100 && amount <= currentMoney) {
                // หักเงินออก
                const updatedMoney = currentMoney - amount;
                
                // อัปเดทยอดเงินของสมาชิก
                const sqlUpdate = "UPDATE members SET money = ? WHERE member_id = ?";
                db.query(sqlUpdate, [updatedMoney, member_id], (err, updateResults) => {
                    if (err) {
                        console.error('Error updating member money:', err);
                        return res.status(500).send('เกิดข้อผิดพลาดในการอัปเดทยอดเงินของสมาชิก');
                    }
                    res.json({ message: 'ยอดเงินถูกอัปเดตเรียบร้อยแล้ว', updatedMoney });
                });
            } else {
                res.status(400).send('จำนวนเงินที่ถอนต้องมากกว่าหรือเท่ากับ 100 และน้อยกว่าหรือเท่ากับยอดเงินที่มี');
            }
        } else {
            res.status(404).send('ไม่พบสมาชิกที่ระบุ');
        }
    });
});


const round = 1;
//สุ่มรางวัลจากทั้งหมด
// app.post('/award_lotto_all', (req, res) => {
//     //const { prize_order, price } = req.body;
//     const sqlCountRows = "COUNT(*) FROM reward";
//     db.query(sqlCountRows, (err, resultsRow) => {
//         if (err) {
//             console.error('Error fetching data:', err);
//             res.status(500).send('An error occurred while fetching data.');
//         } else {
//             if (resultsRow.length > 0) {
//                 res.json(results[0]); // ส่งค่า lotto_id ที่สุ่มได้
//             } else {
//                 const sql = `
//                 SELECT * 
//                 FROM lotto 
//                 WHERE lotto_id NOT IN (SELECT lotto_id FROM reward)
//                 ORDER BY RAND() 
//                 LIMIT 1`; // สุ่ม 1 ค่า
//             db.query(sql, (err, results) => {
//                 if (err) {
//                     console.error('Error fetching data:', err);
//                     res.status(500).send('An error occurred while fetching data.');
//                 } else {
//                     if (results.length > 0) {
//                         res.json(results[0]); // ส่งค่า lotto_id ที่สุ่มได้
//                     } else {
//                         res.status(404).send('No eligible lotto_id found.');
//                     }
//                 }
//             });
//             }
//         }
//     });

// });



app.post('/award_lotto_allnmm', (req, res) => {
    const sqlCountRows = "SELECT COUNT(*) as rowCount FROM reward";
    db.query(sqlCountRows, (err, resultsRow) => {
        if (err) {
            console.error('Error fetching data:', err);
            res.status(500).send('An error occurred while fetching data1.');
        } else {
            // ตรวจสอบผลลัพธ์ที่ได้จากการนับแถว
            const rowCount = resultsRow[0].rowCount;
            if (rowCount > 0) {
                res.json({ message: `There are ${rowCount} rewards in the database.` });
            } else {
                const sql = "SELECT * FROM lotto WHERE lotto_id NOT IN (SELECT lotto_id FROM reward)ORDER BY RAND()LIMIT 1"; // สุ่ม 1 ค่า
                db.query(sql, (err, results) => {
                    if (err) {
                        console.error('Error fetching data:', err);
                        res.status(500).send('An error occurred while fetching data2.');
                    } else {
                        if (results.length > 0) {
                            res.json(results[0]); // ส่งค่า lotto_id ที่สุ่มได้
                        } else {
                            res.status(404).send('No eligible lotto_id found.');
                        }
                    }
                });
            }
        }
    });
});




//ออกรางวัล ทั้งหมด
// app.post('/Award_lotto_all', (req, res) => {
//     const { prizes } = req.body;
//     const selectLottoQuery = `SELECT lotto_id, lotto_number FROM lotto 
//     WHERE lotto_id NOT IN (SELECT lotto_id FROM reward) 
//     ORDER BY RAND() LIMIT 5`;
//     // ตรวจสอบข้อมูลที่ได้รับ
//     if (prizes.length !== 5 || lotto_id.length !== 5) {
//         return res.status(400).send('ข้อมูลไม่ถูกต้อง ต้องส่งหมายเลขล็อตโต้และจำนวนเงินรางวัลครบ 5 รายการ');
//     }

//     // ตรวจสอบว่า lotto_id ทั้งหมดมีอยู่ในตาราง lotto หรือไม่
//     const checkLottoIdsQuery = 'SELECT lotto_id FROM lotto WHERE lotto_id IN (?)';
//     db.query(checkLottoIdsQuery, [lotto_id], (err, result) => {
//         if (err) {
//             console.error('Error checking lotto_id existence:', err);
//             return res.status(500).send('เกิดข้อผิดพลาดในการตรวจสอบหมายเลขล็อตโต้');
//         }

//         // เปรียบเทียบว่า id ที่ได้รับทั้งหมดมีอยู่ในฐานข้อมูลหรือไม่
//         const existingLottoIds = result.map(row => row.lotto_id);
//         const isValid = lotto_id.every(id => existingLottoIds.includes(id));

//         if (!isValid) {
//             return res.status(400).send('หมายเลขล็อตโต้บางตัวไม่มีอยู่ในฐานข้อมูล');
//         }

//         // ตรวจสอบว่าเลขล็อตโต้ที่สุ่มมาต้องไม่ซ้ำกับเลขล็อตโต้ที่มีอยู่ในตาราง reward ทั้งหมด
//         const checkExistingNumbersQuery = 'SELECT lotto_id FROM reward WHERE lotto_id IN (?)';
//         db.query(checkExistingNumbersQuery, [lotto_id], (err, result) => {
//             if (err) {
//                 console.error('Error checking existing lotto numbers:', err);
//                 return res.status(500).send('เกิดข้อผิดพลาดในการตรวจสอบเลขล็อตโต้ที่มีอยู่');
//             }

//             // ตรวจสอบว่าเลขล็อตโต้ที่ได้รับมีอยู่ในฐานข้อมูลหรือไม่
//             const existingLottoNumbers = result.map(row => row.lotto_id);
//             const hasDuplicate = lotto_id.some(number => existingLottoNumbers.includes(number));

//             if (hasDuplicate) {
//                 return res.status(400).send('หมายเลขล็อตโต้บางหมายเลขมีอยู่ในฐานข้อมูลแล้ว');
//             }

//             // ดึง round_number ล่าสุดจากฐานข้อมูล
//             const getLatestRoundQuery = 'SELECT MAX(round) AS latestRound FROM reward';
//             db.query(getLatestRoundQuery, (err, result) => {
//                 if (err) {
//                     console.error('Error fetching latest round number:', err);
//                     return res.status(500).send('เกิดข้อผิดพลาดในการดึงข้อมูลรอบล่าสุด');
//                 }

//                 // กำหนด round_number ใหม่ (เพิ่มจากรอบล่าสุด 1)
//                 const latestRound = result[0].latestRound || 0;
//                 const newRoundNumber = latestRound + 1;

//                 // กำหนดวันที่ปัจจุบัน
//                 const currentDate = new Date();

//                 // เตรียมข้อมูลสำหรับการแทรกผลการออกรางวัล
//                 const insertQuery = `INSERT INTO reward (round, lotto_id, lotto_number, price, prize_order, date) VALUES ?`;
//                 const values = lotto_numbers.map((lotto_number, index) => [
//                     newRoundNumber,        // round_number
//                     lotto_id[index],       // lotto_id
//                     lotto_number,          // lotto_number
//                     prizes[index],         // price
//                     index + 1,             // prize_order (กำหนดลำดับรางวัล 1-5)
//                     currentDate            // date
//                 ]);

//                 // แทรกข้อมูลรอบใหม่ลงในฐานข้อมูล
//                 db.query(insertQuery, [values], (err, result) => {
//                     if (err) {
//                         console.error('Error inserting lotto results:', err);
//                         return res.status(500).send('เกิดข้อผิดพลาดในการบันทึกผลการออกรางวัล');
//                     }
//                     res.status(200).json({ message: 'บันทึกผลการออกรางวัลสำเร็จ', newRoundNumber });
//                 });
//             });
//         });
//     });
// });


app.post('/Award_lotto_all', (req, res) => {
    const { prizes } = req.body;
    // Query to select 5 random lotto_id and lotto_number from the lotto table
    const selectLottoQuery = `
        SELECT lotto_id, lotto_number 
        FROM lotto 
        WHERE lotto_id NOT IN (SELECT lotto_id FROM reward) 
        ORDER BY RAND() 
        LIMIT 5
    `;

    db.query(selectLottoQuery, (err, result) => {
        if (err) {
            console.error('Error selecting random lotto numbers:', err);
            return res.status(500).send('เกิดข้อผิดพลาดในการสุ่มหมายเลขล็อตโต้');
        }

        if (result.length !== 5) {
            return res.status(500).send('ไม่สามารถสุ่มหมายเลขล็อตโต้ได้ครบ 5 รายการ');
        }

        const lottoIds = result.map(row => row.lotto_id);
        const lottoNumbers = result.map(row => row.lotto_number);
        const currentDate = new Date();

        // Simulate prize amounts (assuming the prizes are the same for all)
        //const prizes = [1000, 2000, 3000, 4000, 5000];  // Adjust as needed

        // Get the latest round number
        const getLatestRoundQuery = 'SELECT MAX(round) AS latestRound FROM reward';
        db.query(getLatestRoundQuery, (err, roundResult) => {
            if (err) {
                console.error('Error fetching latest round number:', err);
                return res.status(500).send('เกิดข้อผิดพลาดในการดึงข้อมูลรอบล่าสุด');
            }

            const latestRound = roundResult[0].latestRound || 0;
            const newRoundNumber = latestRound + 1;

            // Prepare data for insertion
            const insertQuery = `
                INSERT INTO reward (round, lotto_id, lotto_number, price, prize_order, date) 
                VALUES ?
            `;
            const values = lottoNumbers.map((lotto_number, index) => [
                newRoundNumber,        // round_number
                lottoIds[index],       // lotto_id
                lotto_number,          // lotto_number
                prizes[index],         // price
                index + 1,             // prize_order (1-5)
                currentDate            // date
            ]);

            // Insert new round data into the database
            db.query(insertQuery, [values], (err) => {
                if (err) {
                    console.error('Error inserting lotto results:', err);
                    return res.status(500).send('เกิดข้อผิดพลาดในการบันทึกผลการออกรางวัล');
                }

                res.status(200).json({ message: 'บันทึกผลการออกรางวัลสำเร็จ', newRoundNumber });
            });
        });
    });
});




app.post('/Award_lotto_status0', (req, res) => {
    const { prizes } = req.body;
    // Query to select 5 random lotto_id and lotto_number from the lotto table
    const selectLottoQuery = `
        SELECT lotto_id, lotto_number 
        FROM lotto 
        WHERE status = 0 AND lotto_id NOT IN (SELECT lotto_id FROM reward) 
        ORDER BY RAND() 
        LIMIT 5
    `;

    db.query(selectLottoQuery, (err, result) => {
        if (err) {
            console.error('Error selecting random lotto numbers:', err);
            return res.status(500).send('เกิดข้อผิดพลาดในการสุ่มหมายเลขล็อตโต้');
        }

        if (result.length !== 5) {
            return res.status(500).send('ไม่สามารถสุ่มหมายเลขล็อตโต้ได้ครบ 5 รายการ');
        }

        const lottoIds = result.map(row => row.lotto_id);
        const lottoNumbers = result.map(row => row.lotto_number);
        const currentDate = new Date();

        // Simulate prize amounts (assuming the prizes are the same for all)
        //const prizes = [1000, 2000, 3000, 4000, 5000];  // Adjust as needed

        // Get the latest round number
        const getLatestRoundQuery = 'SELECT MAX(round) AS latestRound FROM reward';
        db.query(getLatestRoundQuery, (err, roundResult) => {
            if (err) {
                console.error('Error fetching latest round number:', err);
                return res.status(500).send('เกิดข้อผิดพลาดในการดึงข้อมูลรอบล่าสุด');
            }

            const latestRound = roundResult[0].latestRound || 0;
            const newRoundNumber = latestRound + 1;

            // Prepare data for insertion
            const insertQuery = `
                INSERT INTO reward (round, lotto_id, lotto_number, price, prize_order, date) 
                VALUES ?
            `;
            const values = lottoNumbers.map((lotto_number, index) => [
                newRoundNumber,        // round_number
                lottoIds[index],       // lotto_id
                lotto_number,          // lotto_number
                prizes[index],         // price
                index + 1,             // prize_order (1-5)
                currentDate            // date
            ]);

            // Insert new round data into the database
            db.query(insertQuery, [values], (err) => {
                if (err) {
                    console.error('Error inserting lotto results:', err);
                    return res.status(500).send('เกิดข้อผิดพลาดในการบันทึกผลการออกรางวัล');
                }

                res.status(200).json({ message: 'บันทึกผลการออกรางวัลสำเร็จ', newRoundNumber });
            });
        });
    });
});


app.get('/get_reward', (req, res) => {
    const sql = 'SELECT * FROM reward WHERE round = (SELECT MAX(round) FROM reward)';

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching rewards:', err);
            return res.status(500).send('An error occurred while fetching rewards.');
        }

        if (results.length === 0) {
            return res.status(404).send('No rewards found for the latest round.');
        }

        res.status(200).json(results);
    });
});


app.get('/check_reward', (req, res) => {
    const { lotto_id } = req.query;
    if (!lotto_id) {
        return res.status(400).json({ error: 'lotto_id is required' });
    }
    const sql = "SELECT * FROM reward WHERE lotto_id = ?";

    db.query(sql, [lotto_id], (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ error: 'Error retrieving reward data' });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: 'คุณถูกหวยกิน',data: 0 });
        }

        res.json({ message: 'คุณถูกหวย',data: result });
    });
});

// app.post('/up_reward', (req, res) => {
//     const { member_id, lotto_id,  } = req.body;
//     if (!lotto_id && !member_id) {
//         return res.status(400).json({ error: 'lotto_id or member_id is required' });
//     }
//     const sql = "SELECT price FROM reward WHERE lotto_id = ?";

//     db.query(sql, [lotto_id], (err, result) => {
//         if (err) {
//             console.error('Error executing query:', err);
//             return res.status(500).json({ error: 'Error retrieving reward data' });
//         }

//         if (result.length === 0) {
//             return res.status(404).json({ message: 'ขึ้นเงินไม่ได้1' });
//         }
//         const sqlUp = "UPDATE members SET money = money + ? WHERE member_id = ?";
//         db.query(sql, [result.price, member_id], (err, resultUp) => {
//             if (err) {
//                 console.error('Error executing query:', err);
//                 return res.status(500).json({ error: 'Error retrieving reward data' });
//             }
    
//             if (result.length === 0) {
//                 return res.status(404).json({ message: 'ขึ้นเงินไม่ได้2' });
//             }
//             res.json({ data: resultUp });
//         });
//     });
// });


app.post('/up_reward', (req, res) => {
    const { member_id, lotto_id } = req.body;
    
    if (!lotto_id || !member_id) {
        return res.status(400).json({ error: 'lotto_id and member_id are required' });
    }

    // คำสั่ง SQL เพื่อดึงข้อมูลราคา (price) ของรางวัลจากตาราง reward
    const sqlSelect = "SELECT price FROM reward WHERE lotto_id = ?";

    db.query(sqlSelect, [lotto_id], (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ error: 'Error retrieving reward data' });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: 'ไม่พบข้อมูลรางวัลสำหรับ lotto_id นี้' });
        }

        // ดึงข้อมูลราคาจากผลลัพธ์ของ Query
        const price = result[0].price;

        // คำสั่ง SQL เพื่ออัปเดตจำนวนเงินของสมาชิกในตาราง members
        const sqlUpdate = "UPDATE members SET money = money + ? WHERE member_id = ?";

        db.query(sqlUpdate, [price, member_id], (err, resultUp) => {
            if (err) {
                console.error('Error executing update query:', err);
                return res.status(500).json({ error: 'Error updating member money' });
            }

            if (resultUp.affectedRows === 0) {
                return res.status(404).json({ message: 'ไม่พบสมาชิกที่ต้องการอัปเดตเงิน' });
            }

            // เมื่ออัปเดตเงินสำเร็จแล้ว ลบข้อมูลในตารางที่เกี่ยวข้อง
            const sqlDeleteBasket = "DELETE FROM basket WHERE lotto_id = ?";
            const sqlDeleteBuy = "DELETE FROM buy WHERE lotto_id = ?";
            const sqlDeleteLotto = "DELETE FROM lotto WHERE lotto_id = ?";
            const sqlDeleteReward = "DELETE FROM reward WHERE lotto_id = ?";
            const sqlDeleteRandomReward = "DELETE FROM random_reward WHERE lotto_id = ?";

            db.query(sqlDeleteBasket, [member_id], (err, resultBasket) => {
                if (err) {
                    console.error('Error executing delete from basket:', err);
                    return res.status(500).json({ error: 'Error deleting data from basket' });
                }

                db.query(sqlDeleteBuy, [lotto_id], (err, resultBuy) => {
                    if (err) {
                        console.error('Error executing delete from buy:', err);
                        return res.status(500).json({ error: 'Error deleting data from buy' });
                    }

                    db.query(sqlDeleteLotto, [lotto_id], (err, resultLotto) => {
                        if (err) {
                            console.error('Error executing delete from lotto:', err);
                            return res.status(500).json({ error: 'Error deleting data from lotto' });
                        }

                        db.query(sqlDeleteReward, [lotto_id], (err, resultReward) => {
                            if (err) {
                                console.error('Error executing delete from reward:', err);
                                return res.status(500).json({ error: 'Error deleting data from reward' });
                            }

                            db.query(sqlDeleteRandomReward, [lotto_id], (err, resultRandomReward) => {
                                if (err) {
                                    console.error('Error executing delete from random_reward:', err);
                                    return res.status(500).json({ error: 'Error deleting data from random_reward' });
                                }

                                res.json({ 
                                    message: 'อัปเดตเงินและลบข้อมูลสำเร็จ',
                                    updatedRows: resultUp.affectedRows
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});




//สุ่มรางวัล จาก lotto ทั้งหมด

app.post('/randomReward', (req, res) => {
    // รับค่าจาก query parameters
    const prizeOrder = parseInt(req.query.prize_order);
    
    // ตรวจสอบว่าค่าที่ส่งมามีหรือไม่
    if (!prizeOrder || isNaN(prizeOrder)) {
        return res.status(400).send('Missing or invalid prize_order parameter.');
    }

    // Step 1: สุ่มรางวัลจากตาราง lotto
    const selectLottoQuery = 'SELECT lotto_id, lotto_number FROM lotto ORDER BY RAND() LIMIT 1';
    
    db.query(selectLottoQuery, (err, lottoResults) => {
        if (err) {
            console.error('Error fetching lotto numbers:', err);
            return res.status(500).send('An error occurred while fetching lotto numbers.');
        }

        if (lottoResults.length === 0) {
            return res.status(404).send('No lotto numbers found.');
        }

        const { lotto_id, lotto_number } = lottoResults[0];

        // Step 2: ตรวจสอบว่ามีการซ้ำกับ random_reward หรือไม่
        const checkRandomRewardQuery = 'SELECT * FROM random_reward WHERE lotto_id = ? AND lotto_number = ?';
        
        db.query(checkRandomRewardQuery, [lotto_id, lotto_number], (err, randomRewardResults) => {
            if (err) {
                console.error('Error checking random_reward:', err);
                return res.status(500).send('An error occurred while checking random_reward.');
            }

            if (randomRewardResults.length > 0) {
                return res.status(400).send('The selected lotto number is already in random_reward.');
            }

            // Step 3: แทรกข้อมูลใหม่ลงใน random_reward
            const insertRandomRewardQuery = 'INSERT INTO random_reward (lotto_id, lotto_number, prize_order) VALUES (?, ?, ?)';
            
            db.query(insertRandomRewardQuery, [lotto_id, lotto_number, prizeOrder], (err, insertResults) => {
                if (err) {
                    console.error('Error inserting into random_reward:', err);
                    return res.status(500).send('An error occurred while inserting into random_reward.');
                }

                // Step 4: ส่งค่าที่บันทึกออกไปเป็น JSON
                const insertedData = {
                    random_reward_id: insertResults.insertId, // ID ของการแทรกข้อมูล
                    lotto_id,
                    lotto_number,
                    prize_order: prizeOrder
                };

                res.status(200).json(insertedData);
            });
        });
    });
});

//สุ่มรางวัล จาก lotto ที่ขายแล้ว
app.post('/randomReward_Buy', (req, res) => {
    // รับค่าจาก query parameters
    const prizeOrder = parseInt(req.query.prize_order);
    
    // ตรวจสอบว่าค่าที่ส่งมามีหรือไม่
    if (!prizeOrder || isNaN(prizeOrder)) {
        return res.status(400).send('Missing or invalid prize_order parameter.');
    }

    // Step 1: สุ่มรางวัลจากตาราง lotto status = 0
    const selectLottoQuery = 'SELECT lotto_id, lotto_number FROM lotto WHERE status = 0 ORDER BY RAND() LIMIT 1';
    
    db.query(selectLottoQuery, (err, lottoResults) => {
        if (err) {
            console.error('Error fetching lotto numbers:', err);
            return res.status(500).send('An error occurred while fetching lotto numbers.');
        }

        if (lottoResults.length === 0) {
            return res.status(404).send('No lotto numbers found.');
        }

        const { lotto_id, lotto_number } = lottoResults[0];

        // Step 2: ตรวจสอบว่ามีการซ้ำกับ random_reward หรือไม่
        const checkRandomRewardQuery = 'SELECT * FROM random_reward WHERE lotto_id = ? AND lotto_number = ?';
        
        db.query(checkRandomRewardQuery, [lotto_id, lotto_number], (err, randomRewardResults) => {
            if (err) {
                console.error('Error checking random_reward:', err);
                return res.status(500).send('An error occurred while checking random_reward.');
            }

            if (randomRewardResults.length > 0) {
                return res.status(400).send('The selected lotto number is already in random_reward.');
            }

            // Step 3: แทรกข้อมูลใหม่ลงใน random_reward
            const insertRandomRewardQuery = 'INSERT INTO random_reward (lotto_id, lotto_number, prize_order) VALUES (?, ?, ?)';
            
            db.query(insertRandomRewardQuery, [lotto_id, lotto_number, prizeOrder], (err, insertResults) => {
                if (err) {
                    console.error('Error inserting into random_reward:', err);
                    return res.status(500).send('An error occurred while inserting into random_reward.');
                }

                // Step 4: ส่งค่าที่บันทึกออกไปเป็น JSON
                const insertedData = {
                    random_reward_id: insertResults.insertId, // ID ของการแทรกข้อมูล
                    lotto_id,
                    lotto_number,
                    prize_order: prizeOrder
                };

                res.status(200).json(insertedData);
            });
        });
    });
});


app.delete('/reset_system', (req, res) => {
    // คำสั่ง SQL สำหรับการลบข้อมูลในแต่ละตาราง
    const sqlDeleteBasket = "DELETE FROM basket";
    const sqlDeleteBuy = "DELETE FROM buy";
    const sqlDeleteLotto = "DELETE FROM lotto";
    const sqlDeleteReward = "DELETE FROM reward";
    const sqlDeleteRandomReward = "DELETE FROM random_reward";
    // คำสั่ง SQL สำหรับการลบข้อมูลในตาราง members ยกเว้นแถวที่มี type เป็น 'admin'
    const sqlDeleteMembers = "DELETE FROM members WHERE type != 'admin'";

    // ลบข้อมูลจากตาราง basket
    db.query(sqlDeleteBasket, (err, resultBasket) => {
        if (err) {
            console.error('Error deleting from basket:', err);
            return res.status(500).json({ error: 'Error deleting data from basket' });
        }

        // ลบข้อมูลจากตาราง buy
        db.query(sqlDeleteBuy, (err, resultBuy) => {
            if (err) {
                console.error('Error deleting from buy:', err);
                return res.status(500).json({ error: 'Error deleting data from buy' });
            }

            // ลบข้อมูลจากตาราง lotto
            db.query(sqlDeleteLotto, (err, resultLotto) => {
                if (err) {
                    console.error('Error deleting from lotto:', err);
                    return res.status(500).json({ error: 'Error deleting data from lotto' });
                }

                // ลบข้อมูลจากตาราง reward
                db.query(sqlDeleteReward, (err, resultReward) => {
                    if (err) {
                        console.error('Error deleting from reward:', err);
                        return res.status(500).json({ error: 'Error deleting data from reward' });
                    }

                    // ลบข้อมูลจากตาราง random_reward
                    db.query(sqlDeleteRandomReward, (err, resultRandomReward) => {
                        if (err) {
                            console.error('Error deleting from random_reward:', err);
                            return res.status(500).json({ error: 'Error deleting data from random_reward' });
                        }

                        // ลบข้อมูลจากตาราง members ยกเว้นที่ type เป็น 'admin'
                        db.query(sqlDeleteMembers, (err, resultMembers) => {
                            if (err) {
                                console.error('Error deleting from members:', err);
                                return res.status(500).json({ error: 'Error deleting data from members' });
                            }

                            res.json({ message: 'ระบบรีเซ็ตข้อมูลสำเร็จ' });
                        });
                    });
                });
            });
        });
    });
});


app.get('/count_rows_lotto', (req, res) => {
    // SQL query to count the total number of rows in the lotto table
    const sql = 'SELECT COUNT(*) AS total FROM lotto';

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching count of lotto rows:', err);
            return res.status(500).send('เกิดข้อผิดพลาดในการดึงข้อมูลจำนวนแถวของล็อตโต้');
        }

        if (results.length === 0) {
            return res.status(404).send('ไม่พบข้อมูลจำนวนแถวของล็อตโต้');
        }

        // Send back the count of rows
        res.status(200).json({ results });
    });
});




module.exports = app;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
