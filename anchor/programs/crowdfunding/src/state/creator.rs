use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Creator {
    pub owner: Pubkey,

    #[max_len(20)]
    pub username: String,

    #[max_len(100)]
    pub fullname: String,

    #[max_len(250)]
    pub bio: String,

    pub bump: u8,
}
