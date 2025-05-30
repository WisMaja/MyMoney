﻿using System;
using System.ComponentModel.DataAnnotations;

namespace api.Dtos.Transaction
{
    public class CreateTransactionDto
    {
        [Required]
        public Guid WalletId { get; set; }

        public Guid? CategoryId { get; set; }

        [Required]
        public decimal Amount { get; set; } // dodatnia liczba — logika ujemna/dodatnia jest w kontrolerze

        [MaxLength(255)]
        public string? Description { get; set; }
        
        // Pozwala na określenie daty transakcji (jeśli nie podano, użyjemy bieżącej daty)
        public DateTime? CreatedAt { get; set; }
    }
}