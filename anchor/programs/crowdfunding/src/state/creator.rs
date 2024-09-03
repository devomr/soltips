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

    #[max_len(2048)]
    pub image_url: String,

    pub is_supporters_count_visible: bool,

    pub price_per_donation: u64, // in lamports

    #[max_len(10)]
    pub donation_item: String,

    #[max_len(7)]
    pub theme_color: String,

    #[max_len(250)]
    pub thanks_message: String,

    pub supporters_count: u64,
    pub campaigns_count: u64,

    pub supporter_donations_amount: u64,

    #[max_len(5, 250)]
    pub social_links: Vec<String>,

    pub bump: u8,
}
