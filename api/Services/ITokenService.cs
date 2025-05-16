using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using api.Models;
using Microsoft.IdentityModel.Tokens;

namespace api.Services
{
    public interface ITokenService
    {
        public (string token, DateTime expiration) GenerateRefreshToken();
        public string GenerateAccessToken(User user);
        public ClaimsPrincipal? ValidateAndGetPrincipalFromJwt(string token, bool validateLifetime = true);
    }

    public class TokenService : ITokenService
    {
        public string GenerateAccessToken(User user)
        {
            var userClaims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes("e5be8f13-627b-4632-805f-37a86ce0d76d")
            );

            var token = new JwtSecurityToken(
                claims: userClaims,
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
            );

            return new JwtSecurityTokenHandler().WriteToken(token);

        }

        public (string token, DateTime expiration) GenerateRefreshToken()
        {
            return (Guid.NewGuid().ToString(), DateTime.UtcNow.AddHours(24));
        }

        public ClaimsPrincipal? ValidateAndGetPrincipalFromJwt(string token, bool validateLifetime = true)
        {
            try
            {
                // app-settings
                var tokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes("e5be8f13-627b-4632-805f-37a86ce0d76d")),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = validateLifetime,
                    ClockSkew = TimeSpan.Zero
                };
                
                ClaimsPrincipal? principal = new JwtSecurityTokenHandler()
                    .ValidateToken(token, tokenValidationParameters, out var securityToken);

                var jwtSecurityToken = securityToken as JwtSecurityToken;
                if (jwtSecurityToken is null || !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256,
                        StringComparison.InvariantCultureIgnoreCase))
                {
                    return null;
                }

                return principal;
            }
            catch
            {
                return null;
            }
        }
    }
}