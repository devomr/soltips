use anchor_lang::prelude::*;

#[constant]
pub const SEED: &str = "anchor";
pub const ANCHOR_DISCRIMINATOR: usize = 8;

#[constant]
pub const CREATOR_TAG: &[u8] = b"creator";

#[constant]
pub const USERNAME_TAG: &[u8] = b"username";

#[constant]
pub const SUPPORTER_DONATION_TAG: &[u8] = b"supporterDonation";

#[constant]
pub const CAMPAIGN_TAG: &[u8] = b"campaign";

#[constant]
pub const SUPPORTER_DONATION_FEE_PERCENTAGE: u64 = 1;
