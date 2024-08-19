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

    pub supporters_count: u64,

    pub bump: u8,
}
