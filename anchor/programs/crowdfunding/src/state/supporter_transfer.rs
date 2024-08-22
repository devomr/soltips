use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct SupporterTransfer {
    pub supporter: Pubkey,

    pub creator: Pubkey,

    #[max_len(50)]
    pub name: String,

    #[max_len(250)]
    pub message: String,

    pub transfer_amount: u64,

    #[max_len(10)]
    pub donation_item: String,

    pub quantity: u16,

    pub timestamp: i64,
    
    pub bump: u8,
}
