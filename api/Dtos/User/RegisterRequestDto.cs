using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace api.Dtos.User
{
    public class RegisterRequestDto
    {
        [Required] 
        [EmailAddress] 
        public required string Email { get; set; }

        [Required] 
        public required string Password { get; set; }
    }
}