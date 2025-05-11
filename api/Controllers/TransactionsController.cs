using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using api.Models;
using api.Data;
using api.DTO;


namespace api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransactionsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public TransactionsController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var transactions = await _db.Transactions
                .Include(t => t.Category)
                .Include(t => t.Budget)
                .Include(t => t.User)
                .ToListAsync();

            return Ok(transactions);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var transaction = await _db.Transactions
                .Include(t => t.Category)
                .Include(t => t.Budget)
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.TransactionId == id);

            if (transaction == null)
                return NotFound();

            return Ok(transaction);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateTransactionDto dto)
        {
            var transaction = new Transaction
            {
                TransactionId = Guid.NewGuid(),
                BudgetId = dto.BudgetId,
                CategoryId = dto.CategoryId,
                UserId = dto.UserId,
                Amount = dto.Amount,
                Type = dto.Type,
                Description = dto.Description,
                TransactionDate = dto.TransactionDate,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _db.Transactions.Add(transaction);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = transaction.TransactionId }, transaction);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, UpdateTransactionDto dto)
        {
            var transaction = await _db.Transactions.FindAsync(id);
            if (transaction == null)
                return NotFound();

            transaction.BudgetId = dto.BudgetId;
            transaction.CategoryId = dto.CategoryId;
            transaction.UserId = dto.UserId;
            transaction.Amount = dto.Amount;
            transaction.Type = dto.Type;
            transaction.Description = dto.Description;
            transaction.TransactionDate = dto.TransactionDate;
            transaction.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var transaction = await _db.Transactions.FindAsync(id);
            if (transaction == null)
                return NotFound();

            _db.Transactions.Remove(transaction);
            await _db.SaveChangesAsync();

            return NoContent();
        }
    }
}