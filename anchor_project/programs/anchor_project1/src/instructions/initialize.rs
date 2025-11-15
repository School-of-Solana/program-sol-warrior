use crate::events::InitVaultEvent;
use crate::state::Vault;
use anchor_lang::prelude::*;

pub fn _init_vault(ctx: Context<InitVault>) -> Result<()> {
    let vault = &mut ctx.accounts.vault;

    vault.creator = ctx.accounts.creator.key();
    vault.bump = ctx.bumps.vault;
    vault.total_tips = 0;

    emit!(InitVaultEvent {
        vault: vault.key(),
        creator: vault.creator.key()
    });

    Ok(())
}

#[derive(Accounts)]
pub struct InitVault<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        init,
        seeds = [b"vault", creator.key().as_ref()],
        bump,
        payer = creator,
        space = 8 + Vault::INIT_SPACE
    )]
    pub vault: Account<'info, Vault>,
    pub system_program: Program<'info, System>,
}
