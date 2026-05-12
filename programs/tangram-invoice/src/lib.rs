use anchor_lang::prelude::*;

declare_id!("TanGRM11111111111111111111111111111111111111");

// ─── Constants ────────────────────────────────────────────────────────────────

pub const INVOICE_ID_MAX_LEN: usize = 32;
pub const COMMODITY_CODE_MAX_LEN: usize = 16;
pub const IPFS_HASH_MAX_LEN: usize = 64;
pub const REJECTION_REASON_MAX_LEN: usize = 256;

/// Invoice account space:
/// discriminator(8) + invoice_id(36) + exporter(32) + buyer(32)
/// + amount_usdc(8) + commodity_code(20) + sustainability_ipfs_hash(68)
/// + carbon_score(1) + status(1) + nft_mint(33 = Option<Pubkey>)
/// + created_at(8) + verified_at(9) + rejection_reason(260) + listed_ask_price(9)
/// + funded_by(33) + funded_at(9) + completed_at(9) + bump(1)
pub const INVOICE_SPACE: usize = 8
    + 4 + INVOICE_ID_MAX_LEN
    + 32
    + 32
    + 8
    + 4 + COMMODITY_CODE_MAX_LEN
    + 4 + IPFS_HASH_MAX_LEN
    + 1
    + 1
    + 1 + 32  // Option<Pubkey>
    + 8
    + 1 + 8   // Option<i64>
    + 4 + REJECTION_REASON_MAX_LEN
    + 1 + 8   // Option<u64>
    + 1 + 32  // Option<Pubkey>
    + 1 + 8   // Option<i64>
    + 1 + 8   // Option<i64>
    + 1;      // bump

// ─── State ────────────────────────────────────────────────────────────────────

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum InvoiceStatus {
    Pending,
    Verified,
    Rejected,
    Listed,
    Funded,
    Completed,
}

impl Default for InvoiceStatus {
    fn default() -> Self {
        InvoiceStatus::Pending
    }
}

#[account]
#[derive(Default)]
pub struct Invoice {
    pub invoice_id: String,
    pub exporter: Pubkey,
    pub buyer: Pubkey,
    /// Amount in USDC micro-units (6 decimal places)
    pub amount_usdc: u64,
    pub commodity_code: String,
    pub sustainability_ipfs_hash: String,
    /// ESG/carbon score 0–100
    pub carbon_score: u8,
    pub status: u8, // InvoiceStatus as u8 for easy serialisation
    pub nft_mint: Option<Pubkey>,
    pub created_at: i64,
    pub verified_at: Option<i64>,
    pub rejection_reason: Option<String>,
    pub listed_ask_price: Option<u64>,
    pub funded_by: Option<Pubkey>,
    pub funded_at: Option<i64>,
    pub completed_at: Option<i64>,
    pub bump: u8,
}

// ─── Errors ───────────────────────────────────────────────────────────────────

#[error_code]
pub enum TangramError {
    #[msg("Invoice is not in the expected status for this operation")]
    InvalidStatus,
    #[msg("Invoice ID exceeds maximum length")]
    InvoiceIdTooLong,
    #[msg("Commodity code exceeds maximum length")]
    CommodityCodeTooLong,
    #[msg("IPFS hash exceeds maximum length")]
    IpfsHashTooLong,
    #[msg("Rejection reason exceeds maximum length")]
    RejectionReasonTooLong,
    #[msg("Carbon score must be between 0 and 100")]
    InvalidCarbonScore,
    #[msg("Unauthorized: only the designated verifier can perform this action")]
    Unauthorized,
    #[msg("Ask price must be greater than zero")]
    InvalidAskPrice,
}

// ─── Events ───────────────────────────────────────────────────────────────────

#[event]
pub struct InvoiceSubmitted {
    pub invoice_pda: Pubkey,
    pub invoice_id: String,
    pub exporter: Pubkey,
    pub amount_usdc: u64,
    pub timestamp: i64,
}

#[event]
pub struct InvoiceVerified {
    pub invoice_pda: Pubkey,
    pub invoice_id: String,
    pub verifier: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct InvoiceRejected {
    pub invoice_pda: Pubkey,
    pub invoice_id: String,
    pub reason: String,
    pub timestamp: i64,
}

#[event]
pub struct InvoiceFunded {
    pub invoice_pda: Pubkey,
    pub financier: Pubkey,
    pub ask_price: u64,
    pub timestamp: i64,
}

#[event]
pub struct ReceiptConfirmed {
    pub invoice_pda: Pubkey,
    pub buyer: Pubkey,
    pub timestamp: i64,
}

// ─── Accounts ─────────────────────────────────────────────────────────────────

#[derive(Accounts)]
#[instruction(invoice_id: String)]
pub struct SubmitInvoice<'info> {
    #[account(
        init,
        payer = exporter,
        space = INVOICE_SPACE,
        seeds = [b"invoice", exporter.key().as_ref(), invoice_id.as_bytes()],
        bump,
    )]
    pub invoice: Account<'info, Invoice>,

    #[account(mut)]
    pub exporter: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct VerifyInvoice<'info> {
    #[account(
        mut,
        seeds = [b"invoice", invoice.exporter.as_ref(), invoice.invoice_id.as_bytes()],
        bump = invoice.bump,
        constraint = invoice.status == InvoiceStatus::Pending as u8 @ TangramError::InvalidStatus,
    )]
    pub invoice: Account<'info, Invoice>,

    /// The verifier authority — in MVP this is any signer; replace with
    /// a config PDA that stores the verifier pubkey for production.
    pub verifier: Signer<'info>,
}

#[derive(Accounts)]
pub struct RejectInvoice<'info> {
    #[account(
        mut,
        seeds = [b"invoice", invoice.exporter.as_ref(), invoice.invoice_id.as_bytes()],
        bump = invoice.bump,
        constraint = invoice.status == InvoiceStatus::Pending as u8 @ TangramError::InvalidStatus,
    )]
    pub invoice: Account<'info, Invoice>,

    pub verifier: Signer<'info>,
}

#[derive(Accounts)]
pub struct CreateListing<'info> {
    #[account(
        mut,
        seeds = [b"invoice", invoice.exporter.as_ref(), invoice.invoice_id.as_bytes()],
        bump = invoice.bump,
        constraint = invoice.status == InvoiceStatus::Verified as u8 @ TangramError::InvalidStatus,
        constraint = invoice.exporter == exporter.key() @ TangramError::Unauthorized,
    )]
    pub invoice: Account<'info, Invoice>,

    pub exporter: Signer<'info>,
}

#[derive(Accounts)]
pub struct FundInvoice<'info> {
    #[account(
        mut,
        seeds = [b"invoice", invoice.exporter.as_ref(), invoice.invoice_id.as_bytes()],
        bump = invoice.bump,
        constraint = invoice.status == InvoiceStatus::Listed as u8 @ TangramError::InvalidStatus,
    )]
    pub invoice: Account<'info, Invoice>,

    #[account(mut)]
    pub financier: Signer<'info>,
}

#[derive(Accounts)]
pub struct ConfirmReceipt<'info> {
    #[account(
        mut,
        seeds = [b"invoice", invoice.exporter.as_ref(), invoice.invoice_id.as_bytes()],
        bump = invoice.bump,
        constraint = invoice.status == InvoiceStatus::Funded as u8 @ TangramError::InvalidStatus,
        constraint = invoice.buyer == buyer.key() @ TangramError::Unauthorized,
    )]
    pub invoice: Account<'info, Invoice>,

    pub buyer: Signer<'info>,
}

#[derive(Accounts)]
pub struct AttachSustainabilityData<'info> {
    #[account(
        mut,
        seeds = [b"invoice", invoice.exporter.as_ref(), invoice.invoice_id.as_bytes()],
        bump = invoice.bump,
        constraint = invoice.exporter == exporter.key() @ TangramError::Unauthorized,
        constraint = invoice.status == InvoiceStatus::Pending as u8 @ TangramError::InvalidStatus,
    )]
    pub invoice: Account<'info, Invoice>,

    pub exporter: Signer<'info>,
}

// ─── Program ──────────────────────────────────────────────────────────────────

#[program]
pub mod tangram_invoice {
    use super::*;

    /// Exporter submits a new export invoice for verification.
    pub fn submit_invoice(
        ctx: Context<SubmitInvoice>,
        invoice_id: String,
        amount_usdc: u64,
        buyer: Pubkey,
        commodity_code: String,
        sustainability_ipfs_hash: String,
        carbon_score: u8,
    ) -> Result<()> {
        require!(invoice_id.len() <= INVOICE_ID_MAX_LEN, TangramError::InvoiceIdTooLong);
        require!(commodity_code.len() <= COMMODITY_CODE_MAX_LEN, TangramError::CommodityCodeTooLong);
        require!(sustainability_ipfs_hash.len() <= IPFS_HASH_MAX_LEN, TangramError::IpfsHashTooLong);
        require!(carbon_score <= 100, TangramError::InvalidCarbonScore);

        let invoice = &mut ctx.accounts.invoice;
        let clock = Clock::get()?;

        invoice.invoice_id = invoice_id.clone();
        invoice.exporter = ctx.accounts.exporter.key();
        invoice.buyer = buyer;
        invoice.amount_usdc = amount_usdc;
        invoice.commodity_code = commodity_code;
        invoice.sustainability_ipfs_hash = sustainability_ipfs_hash;
        invoice.carbon_score = carbon_score;
        invoice.status = InvoiceStatus::Pending as u8;
        invoice.nft_mint = None;
        invoice.created_at = clock.unix_timestamp;
        invoice.verified_at = None;
        invoice.rejection_reason = None;
        invoice.listed_ask_price = None;
        invoice.funded_by = None;
        invoice.funded_at = None;
        invoice.completed_at = None;
        invoice.bump = ctx.bumps.invoice;

        emit!(InvoiceSubmitted {
            invoice_pda: invoice.key(),
            invoice_id,
            exporter: invoice.exporter,
            amount_usdc,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    /// Verifier approves the invoice. Frontend subsequently mints the cNFT via Bubblegum.
    pub fn verify_invoice(ctx: Context<VerifyInvoice>) -> Result<()> {
        let invoice = &mut ctx.accounts.invoice;
        let clock = Clock::get()?;

        invoice.status = InvoiceStatus::Verified as u8;
        invoice.verified_at = Some(clock.unix_timestamp);

        emit!(InvoiceVerified {
            invoice_pda: invoice.key(),
            invoice_id: invoice.invoice_id.clone(),
            verifier: ctx.accounts.verifier.key(),
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    /// Verifier rejects the invoice with a reason.
    pub fn reject_invoice(ctx: Context<RejectInvoice>, reason: String) -> Result<()> {
        require!(reason.len() <= REJECTION_REASON_MAX_LEN, TangramError::RejectionReasonTooLong);

        let invoice = &mut ctx.accounts.invoice;
        let clock = Clock::get()?;

        invoice.status = InvoiceStatus::Rejected as u8;
        invoice.rejection_reason = Some(reason.clone());
        invoice.verified_at = Some(clock.unix_timestamp);

        emit!(InvoiceRejected {
            invoice_pda: invoice.key(),
            invoice_id: invoice.invoice_id.clone(),
            reason,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    /// Exporter lists a verified invoice on the marketplace with an asking price.
    pub fn create_listing(ctx: Context<CreateListing>, ask_price: u64) -> Result<()> {
        require!(ask_price > 0, TangramError::InvalidAskPrice);

        let invoice = &mut ctx.accounts.invoice;
        invoice.status = InvoiceStatus::Listed as u8;
        invoice.listed_ask_price = Some(ask_price);

        Ok(())
    }

    /// Financier funds a listed invoice. USDC transfer handled off-chain via SPL token.
    pub fn fund_invoice(ctx: Context<FundInvoice>) -> Result<()> {
        let invoice = &mut ctx.accounts.invoice;
        let clock = Clock::get()?;

        invoice.status = InvoiceStatus::Funded as u8;
        invoice.funded_by = Some(ctx.accounts.financier.key());
        invoice.funded_at = Some(clock.unix_timestamp);

        emit!(InvoiceFunded {
            invoice_pda: invoice.key(),
            financier: ctx.accounts.financier.key(),
            ask_price: invoice.listed_ask_price.unwrap_or(0),
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    /// Buyer confirms receipt of goods, completing the invoice lifecycle.
    pub fn confirm_receipt(ctx: Context<ConfirmReceipt>) -> Result<()> {
        let invoice = &mut ctx.accounts.invoice;
        let clock = Clock::get()?;

        invoice.status = InvoiceStatus::Completed as u8;
        invoice.completed_at = Some(clock.unix_timestamp);

        emit!(ReceiptConfirmed {
            invoice_pda: invoice.key(),
            buyer: ctx.accounts.buyer.key(),
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    /// Exporter updates sustainability data while invoice is still pending.
    pub fn attach_sustainability_data(
        ctx: Context<AttachSustainabilityData>,
        ipfs_hash: String,
        carbon_score: u8,
    ) -> Result<()> {
        require!(ipfs_hash.len() <= IPFS_HASH_MAX_LEN, TangramError::IpfsHashTooLong);
        require!(carbon_score <= 100, TangramError::InvalidCarbonScore);

        let invoice = &mut ctx.accounts.invoice;
        invoice.sustainability_ipfs_hash = ipfs_hash;
        invoice.carbon_score = carbon_score;

        Ok(())
    }
}
