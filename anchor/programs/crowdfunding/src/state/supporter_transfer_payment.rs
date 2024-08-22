use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct SupporterTransferPayment {
    pub creator: Pubkey,

    pub amount: u64,

    pub timestamp: i64,

    pub bump: u8,
}
