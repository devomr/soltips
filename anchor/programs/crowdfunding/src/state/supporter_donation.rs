use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct SupporterDonation {
    pub supporter: Pubkey,

    pub creator: Pubkey,

    #[max_len(50)]
    pub name: String,

    #[max_len(250)]
    pub message: String,

    pub amount: u64,

    pub fees: u64,

    #[max_len(10)]
    pub item: String,

    pub quantity: u16,

    pub timestamp: i64,

    pub bump: u8,
}
