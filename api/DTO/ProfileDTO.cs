using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace api.DTO
{
    public class CreateProfileDto
    {
        public string FullName { get; set; } = "";
        public string? AvatarUrl { get; set; }
    }

    public class UpdateProfileDto : CreateProfileDto { }
}