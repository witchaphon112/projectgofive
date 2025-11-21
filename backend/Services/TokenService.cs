using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Backend_UserManage.Models;

namespace Backend_UserManage.Services
{
    public class TokenService : ITokenService
    {
        private readonly IConfiguration _config;

        public TokenService(IConfiguration config)
        {
            _config = config;
        }

        public string CreateToken(User user)
        {
            var tokenKey = _config["JwtSettings:TokenKey"]
                ?? throw new InvalidOperationException("TokenKey not found in configuration");

            if (tokenKey.Length < 32)
                throw new InvalidOperationException("TokenKey must be at least 32 characters long");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tokenKey));

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.GivenName, user.FirstName),
                new Claim(ClaimTypes.Surname, user.LastName),
                new Claim(ClaimTypes.Role, user.Role?.RoleName ?? "User")
            };

            if (user.Permissions != null)
            {
                foreach (var permission in user.Permissions)
                {
                    if (permission.IsReadable)
                        claims.Add(new Claim("Permission", $"{permission.PermissionId}:Read"));
                    if (permission.IsWritable)
                        claims.Add(new Claim("Permission", $"{permission.PermissionId}:Write"));
                    if (permission.IsDeletable)
                        claims.Add(new Claim("Permission", $"{permission.PermissionId}:Delete"));
                }
            }

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            var tokenExpiryDays = int.Parse(_config["JwtSettings:TokenExpiryInDays"] ?? "7");

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddDays(tokenExpiryDays),
                SigningCredentials = creds
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }
    }
}