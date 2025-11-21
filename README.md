Project Go Five (User Management System)

เว็ปไซต์บริหารจัดการผู้ใช้งาน (User Management System) แบบ Full-Stack พัฒนาด้วย Angular, .NET Core Web API, และ SQL Server บน Docker

🛠️ Tech Stack

Frontend: Angular 20+, Tailwind CSS, Angular Material
Backend: .NET Core 9.0 (Web API), Entity Framework Core
Database: Microsoft SQL Server (Running in Docker)
Tools: Docker, Docker Compose, Postman

📋 Prerequisites (สิ่งที่ต้องมีก่อน)
ก่อนเริ่มรันโปรเจกต์ ต้องติดตั้งโปรแกรมเหล่านี้ในเครื่อง:
Node.js (v18+)
.NET SDK (v9.0)
Docker Desktop (จำเป็นต้องเปิดทิ้งไว้)
Git
ทำตามขั้นตอนทีละสเต็ปเพื่อรันโปรเจกต์:

1. Clone Project

git clone https://github.com/witchaphon112/projectgofive.git
cd projectgofive

2. Start Database (Docker)
   รันคำสั่งนี้ที่โฟลเดอร์หลัก (projectgofive/) เพื่อจำลอง Database Server:
   docker compose up -d
   รอจนกว่า Container mssql_backend_db จะขึ้นสถานะ "Up" (เช็คด้วย docker ps)

3. Backend (.NET API)
   เปิด Terminal ใหม่ แล้วเข้าไปที่โฟลเดอร์ backend:
   cd backend
   สร้างฐานข้อมูล (Migration):
   dotnet ef database update

รัน Backend Server:
dotnet watch run
Backend API: http://localhost:5001
Swagger UI: http://localhost:5001/swagger

4. Frontend (Angular)
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

Project Structure
projectgofive/
├── backend/ # .NET Core Web API Project
├── frontend/ # Angular Project
├── docker-compose.yml # Database Configuration (MSSQL)
└── README.md # Manual
