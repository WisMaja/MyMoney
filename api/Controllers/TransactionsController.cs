using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using api.Models;
using api.Data;


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
        public async Task<IActionResult> Create(Transaction transaction)
        {
            transaction.TransactionId = Guid.NewGuid();
            transaction.CreatedAt = DateTime.UtcNow;
            transaction.UpdatedAt = DateTime.UtcNow;

            _db.Transactions.Add(transaction);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = transaction.TransactionId }, transaction);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, Transaction input)
        {
            var transaction = await _db.Transactions.FindAsync(id);
            if (transaction == null)
                return NotFound();

            transaction.Amount = input.Amount;
            transaction.Description = input.Description;
            transaction.Type = input.Type;
            transaction.CategoryId = input.CategoryId;
            transaction.BudgetId = input.BudgetId;
            transaction.UserId = input.UserId;
            transaction.TransactionDate = input.TransactionDate;
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