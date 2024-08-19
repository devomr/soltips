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

    pub transfer_amount: f64,

    #[max_len(20)]
    pub item_type: String,
    pub quantity: u16,
    pub price: f64,
    pub timestamp: i64,
    pub bump: u8,
}