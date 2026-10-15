CREATE TABLE [dbo].[Users] (
  [Id] uniqueidentifier PRIMARY KEY,
  [Email] nvarchar(254) UNIQUE NOT NULL,
  [CreatedAtUtc] datetime2 NOT NULL
)
GO

CREATE TABLE [dbo].[Organizations] (
  [Id] uniqueidentifier PRIMARY KEY,
  [Name] nvarchar(200) NOT NULL,
  [CreatedAtUtc] datetime2 NOT NULL
)
GO

CREATE TABLE [dbo].[OrganizationMemberships] (
  [Id] uniqueidentifier PRIMARY KEY,
  [OrganizationId] uniqueidentifier NOT NULL,
  [UserId] uniqueidentifier NOT NULL,
  [Role] nvarchar(30) NOT NULL,
  [Status] nvarchar(20) NOT NULL DEFAULT 'Accepted',
  CONSTRAINT [CK_OrganizationMemberships_Status] CHECK (Status IN ('Accepted', 'Confirmed', 'Revoked'))
)
GO

CREATE TABLE [dbo].[Collections] (
  [Id] uniqueidentifier PRIMARY KEY,
  [OrganizationId] uniqueidentifier NOT NULL,
  [EncryptedName] nvarchar(max) NOT NULL
)
GO

CREATE TABLE [dbo].[CollectionAccess] (
  [CollectionId] uniqueidentifier NOT NULL,
  [OrganizationMembershipId] uniqueidentifier NOT NULL,
  [Permission] nvarchar(30) NOT NULL,
  PRIMARY KEY ([CollectionId], [OrganizationMembershipId])
)
GO

CREATE TABLE [dbo].[VaultItems] (
  [Id] uniqueidentifier PRIMARY KEY,
  [OrganizationId] uniqueidentifier NOT NULL,
  [EncryptedPayload] nvarchar(max) NOT NULL,
  [PayloadVersion] int NOT NULL DEFAULT (1),
  [CreatedAtUtc] datetime2 NOT NULL,
  [UpdatedAtUtc] datetime2 NOT NULL
)
GO

CREATE TABLE [dbo].[CollectionItems] (
  [CollectionId] uniqueidentifier NOT NULL,
  [VaultItemId] uniqueidentifier NOT NULL,
  PRIMARY KEY ([CollectionId], [VaultItemId])
)
GO

CREATE TABLE [dbo].[ReportSnapshots] (
  [Id] uniqueidentifier PRIMARY KEY,
  [OrganizationId] uniqueidentifier NOT NULL,
  [GeneratedByOrganizationMembershipId] uniqueidentifier NOT NULL,
  [EncryptedPayload] nvarchar(max) NOT NULL,
  [ReportVersion] int NOT NULL DEFAULT (1),
  [GeneratedAtUtc] datetime2 NOT NULL
)
GO

CREATE TABLE [dbo].[OrganizationEvents] (
  [Id] uniqueidentifier PRIMARY KEY,
  [OrganizationId] uniqueidentifier NOT NULL,
  [ActorOrganizationMembershipId] uniqueidentifier,
  [EventType] nvarchar(100) NOT NULL,
  [TargetType] nvarchar(50) NOT NULL,
  [TargetId] uniqueidentifier NOT NULL,
  [OccurredAtUtc] datetime2 NOT NULL,
  [MetadataJson] nvarchar(max)
)
GO

CREATE TABLE [dbo].[UserAuthentication] (
  [Id] uniqueidentifier PRIMARY KEY,
  [UserId] uniqueidentifier UNIQUE NOT NULL,
  [CredentialVerifier] nvarchar(max) NOT NULL,
  [FailedLoginCount] int NOT NULL DEFAULT (0),
  [LockoutEndUtc] datetime2,
  [CredentialUpdatedAtUtc] datetime2 NOT NULL
)
GO

CREATE TABLE [dbo].[UserVaultKeys] (
  [Id] uniqueidentifier PRIMARY KEY,
  [UserId] uniqueidentifier UNIQUE NOT NULL,
  [EncryptedVaultKey] nvarchar(max) NOT NULL,
  [KeyDerivationAlgorithm] nvarchar(30) NOT NULL,
  [KeyDerivationSalt] nvarchar(512) NOT NULL,
  [KeyDerivationParametersJson] nvarchar(max) NOT NULL,
  [KeyFormatVersion] int NOT NULL DEFAULT (1),
  [UpdatedAtUtc] datetime2 NOT NULL
)
GO

CREATE TABLE [dbo].[OrganizationInvitations] (
  [Id] uniqueidentifier PRIMARY KEY,
  [OrganizationId] uniqueidentifier NOT NULL,
  [Email] nvarchar(254) NOT NULL,
  [InvitedByOrganizationMembershipId] uniqueidentifier NOT NULL,
  [TokenHash] varbinary(32) UNIQUE NOT NULL,
  [CreatedAtUtc] datetime2 NOT NULL,
  [ExpiresAtUtc] datetime2 NOT NULL,
  [AcceptedAtUtc] datetime2,
  [RevokedAtUtc] datetime2
)
GO

CREATE UNIQUE INDEX [OrganizationMemberships_index_0] ON [dbo].[OrganizationMemberships] ([OrganizationId], [UserId])
GO

CREATE INDEX [ReportSnapshots_index_1] ON [dbo].[ReportSnapshots] ([OrganizationId], [GeneratedAtUtc])
GO

CREATE INDEX [OrganizationEvents_index_2] ON [dbo].[OrganizationEvents] ([OrganizationId], [OccurredAtUtc], [Id])
GO

CREATE INDEX [OrganizationInvitations_index_3] ON [dbo].[OrganizationInvitations] ([OrganizationId], [Email])
GO

EXEC sp_addextendedproperty
@name = N'Column_Description',
@value = 'Owner, Admin, or Member',
@level0type = N'Schema', @level0name = 'dbo',
@level1type = N'Table',  @level1name = 'OrganizationMemberships',
@level2type = N'Column', @level2name = 'Role';
GO

EXEC sp_addextendedproperty
@name = N'Column_Description',
@value = 'Accepted, Confirmed, or Revoked',
@level0type = N'Schema', @level0name = 'dbo',
@level1type = N'Table',  @level1name = 'OrganizationMemberships',
@level2type = N'Column', @level2name = 'Status';
GO

EXEC sp_addextendedproperty
@name = N'Column_Description',
@value = 'Read or Manage',
@level0type = N'Schema', @level0name = 'dbo',
@level1type = N'Table',  @level1name = 'CollectionAccess',
@level2type = N'Column', @level2name = 'Permission';
GO

EXEC sp_addextendedproperty
@name = N'Column_Description',
@value = 'Encrypted name, URL, username, and password',
@level0type = N'Schema', @level0name = 'dbo',
@level1type = N'Table',  @level1name = 'VaultItems',
@level2type = N'Column', @level2name = 'EncryptedPayload';
GO

EXEC sp_addextendedproperty
@name = N'Column_Description',
@value = 'Encrypted findings, risk counts, and affected-member summaries',
@level0type = N'Schema', @level0name = 'dbo',
@level1type = N'Table',  @level1name = 'ReportSnapshots',
@level2type = N'Column', @level2name = 'EncryptedPayload';
GO

EXEC sp_addextendedproperty
@name = N'Column_Description',
@value = 'Examples: CollectionAccess.Granted, VaultItem.Updated',
@level0type = N'Schema', @level0name = 'dbo',
@level1type = N'Table',  @level1name = 'OrganizationEvents',
@level2type = N'Column', @level2name = 'EventType';
GO

EXEC sp_addextendedproperty
@name = N'Column_Description',
@value = 'Operational metadata only; exclude decrypted vault contents',
@level0type = N'Schema', @level0name = 'dbo',
@level1type = N'Table',  @level1name = 'OrganizationEvents',
@level2type = N'Column', @level2name = 'MetadataJson';
GO

ALTER TABLE [dbo].[OrganizationMemberships] ADD FOREIGN KEY ([OrganizationId]) REFERENCES [dbo].[Organizations] ([Id])
GO

ALTER TABLE [dbo].[OrganizationMemberships] ADD FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users] ([Id])
GO

ALTER TABLE [dbo].[Collections] ADD FOREIGN KEY ([OrganizationId]) REFERENCES [dbo].[Organizations] ([Id])
GO

ALTER TABLE [dbo].[CollectionAccess] ADD FOREIGN KEY ([CollectionId]) REFERENCES [dbo].[Collections] ([Id])
GO

ALTER TABLE [dbo].[CollectionAccess] ADD FOREIGN KEY ([OrganizationMembershipId]) REFERENCES [dbo].[OrganizationMemberships] ([Id])
GO

ALTER TABLE [dbo].[VaultItems] ADD FOREIGN KEY ([OrganizationId]) REFERENCES [dbo].[Organizations] ([Id])
GO

ALTER TABLE [dbo].[CollectionItems] ADD FOREIGN KEY ([CollectionId]) REFERENCES [dbo].[Collections] ([Id])
GO

ALTER TABLE [dbo].[CollectionItems] ADD FOREIGN KEY ([VaultItemId]) REFERENCES [dbo].[VaultItems] ([Id])
GO

ALTER TABLE [dbo].[ReportSnapshots] ADD FOREIGN KEY ([OrganizationId]) REFERENCES [dbo].[Organizations] ([Id])
GO

ALTER TABLE [dbo].[ReportSnapshots] ADD FOREIGN KEY ([GeneratedByOrganizationMembershipId]) REFERENCES [dbo].[OrganizationMemberships] ([Id])
GO

ALTER TABLE [dbo].[OrganizationEvents] ADD FOREIGN KEY ([OrganizationId]) REFERENCES [dbo].[Organizations] ([Id])
GO

ALTER TABLE [dbo].[OrganizationEvents] ADD FOREIGN KEY ([ActorOrganizationMembershipId]) REFERENCES [dbo].[OrganizationMemberships] ([Id])
GO

ALTER TABLE [dbo].[UserAuthentication] ADD FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users] ([Id])
GO

ALTER TABLE [dbo].[UserVaultKeys] ADD FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users] ([Id])
GO

ALTER TABLE [dbo].[OrganizationInvitations] ADD FOREIGN KEY ([OrganizationId]) REFERENCES [dbo].[Organizations] ([Id])
GO

ALTER TABLE [dbo].[OrganizationInvitations] ADD FOREIGN KEY ([InvitedByOrganizationMembershipId]) REFERENCES [dbo].[OrganizationMemberships] ([Id])
GO
