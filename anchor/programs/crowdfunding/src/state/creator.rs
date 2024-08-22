use anchor_lang::prelude::*;

#[account]
#[derive(Debug, InitSpace)]
pub struct Creator {
    pub owner: Pubkey,

    #[max_len(20)]
    pub username: String,

    #[max_len(100)]
    pub fullname: String,

    #[max_len(250)]
    pub bio: String,

    #[max_len(250)]
    pub image_url: String,

    pub is_supporters_count_visible: bool,

    pub price_per_donation: u64, // in lamports

    #[max_len(10)]
    pub donation_item: String,

    #[max_len(250)]
    pub thanks_message: String,

    pub supporters_count: u64,

    pub supporter_payments_count: u64,

    pub withdrawn_funds: u64,

    pub bump: u8,
}
