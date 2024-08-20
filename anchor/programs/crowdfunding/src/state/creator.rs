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

    pub display_supporters_count: bool,

    pub price_per_donation: u64, // in lamports

    #[max_len(10)]
    pub donation_item: String,

    #[max_len(250)]
    pub thank_you_message: String,

    pub supporters_count: u64,
    pub available_funds: u64,
    pub withdrawn_funds: u64,

    pub bump: u8,
}
