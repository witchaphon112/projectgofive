ProjectGoFive

เว็ปไซต์บริหารจัดการผู้ใช้งาน

ทำตามขั้นตอนทีละสเต็ปเพื่อรันโปรเจกต์:

1. Clone Project

git clone [https://github.com/witchaphon112/projectgofive.git](https://github.com/witchaphon112/projectgofive.git)
cd projectgofive

2. Backend (.NET API)
เปิด Terminal ใหม่ แล้วเข้าไปที่โฟลเดอร์ backend:
cd backend
dotnet ef database update

รัน Backend Server:
เชื่อมกับ AWS แล้ว เเต่ดึงข้อมูลapi จะช้านิดหน่อย
dotnet run
ระวังมัน มันerror เพราะโหลดไฟล์มา xattr -cr . แก้
Backend API: http://localhost:5001

3. Frontend (Angular)
เปิด Terminal อีกตัว แล้วเข้าไปที่โฟลเดอร์ frontend:
cd frontend

ติดตั้ง Dependencies
npm install

รันหน้าเว็บ
ng serve

เปิดเว็บได้ที่: http://localhost:4200

สิทธิ์การใช้งาน (Description)
Super Admin
username: Super
password: 012323
จัดการได้ทุกอย่างในเว็บไซต์

Admin
username: Admin
password: 012323
ทำได้ทุกอย่าง ยกเว้นการจัดการ User

Employee
username: Employee
password: 012323
ทำได้แค่ดูข้อมูลต่างๆ

HR Admin
username: ADminhr
password: 012323
ทำได้แค่ดูข้อมูลต่างๆ
