export default class ShadowdarklingImporterSD extends FormApplication {
	/**
	 * Contains an importer function to generate player actors from
	 * Shadowdarklings.net
	 */

	/** @inheritdoc */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["shadowdark-importer"],
			width: 300,
			height: 310,
			resizable: false,
		});
	}

	/** @inheritdoc */
	get template() {
		return "systems/shadowdark/templates/apps/shadowdarkling-importer.hbs";
	}

	/** @inheritdoc */
	get title() {
		const title = game.i18n.localize("SHADOWDARK.apps.shadowdarkling-importer.title");
		return `${title}`;
	}

	/** @inheritdoc */
	_updateObject(event, formData) {
		event.preventDefault();

		try {
			const json = JSON.parse(formData.json);
			return this._importActor(json);
		}
		catch(error) {
			ui.notifications.error(`Couldn't parse the JSON. ${error}`);
		}
	}

	/** @inheritdoc */
	_onSubmit(event) {
		event.preventDefault();
		if (event.submitter.className === "open-generator") {
			return this._openImporter();
		}
		super._onSubmit(event);
	}

	/** Specific methods */

	_openImporter() {
		return new FrameViewer("https://shadowdarklings.net", {
			title: "Shadowdarklings.net",
		}).render(true);
	}

	/**
	 * Parse the spellcasting modifier through the config
	 * @param {string} actorClass - Class from the exported JSON
	 * @returns {string}
	 */
	_getSpellCastingAbility(actorClass) {
		if (Object.keys(CONFIG.SHADOWDARK.SPELL_CASTER_CLASSES).includes(actorClass)) {
			return CONFIG.SHADOWDARK.SPELLCASTING_ABILITY[actorClass];
		}
		return "";
	}

	/**
	 * Manipulates the Spell Advantage talent so it may be used on the actor
	 * @param {string} spell - Spell name to be used for advantage
	 * @returns {ItemSD}
	 */
	async _spellCastingAdvantageTalent(spell) {
		const talent = await this._findInCompendium("Spellcasting Advantage", "shadowdark.talents");
		const modifiedTalent = talent.toObject();
		modifiedTalent.effects[0].changes[0].value = spell.slugify();
		modifiedTalent.name += ` (${spell})`;
		return modifiedTalent;
	}

	/**
	 * Manipulates the Weapon/Armor Mastery talent so it may be used on the actor
	 * @param {string} type - What type of item (armor/weapon)
	 * @param {string} choice - The actual item to be affected
	 * @returns {ItemSD}
	 */
	async _masteryTalent(type, choice) {
		const itemName = choice.split(" ").map(s => s.capitalize()).join(" ");
		const talent = await this._findInCompendium(`${type.capitalize()} Mastery`, "shadowdark.talents");
		const modifiedTalent = talent.toObject();
		modifiedTalent.effects[0].changes[0].value = choice.slugify();
		modifiedTalent.name += ` (${itemName})`;
		return modifiedTalent;
	}

	async _damageDieD12Talent(choice) {
		const itemName = choice.split(":")[0];
		const talent = await this._findInCompendium("Increased Weapon Damage Die", "shadowdark.talents");
		const modifiedTalent = talent.toObject();
		modifiedTalent.effects[0].changes[0].value = choice.split(":")[0].slugify();
		modifiedTalent.name += ` (${itemName})`;
		return modifiedTalent;
	}

	/**
	 * Searches a compendium pack and returns the stored data if a match is found
	 * @param {string} contentName - Name of something that may exist in a compendium
	 * @param {string} packName - id of compendium pack to look inside
	 * @returns {ItemSD|string}
	 */
	async _findInCompendium(contentName, packName) {
		const pack = game.packs.get(packName);
		const itemIndex = pack.index.find(
			i => i.name.toLowerCase() === contentName.toLowerCase()
		);
		if (itemIndex) {
			return pack.getDocument(itemIndex._id);
		}
		return "";
	}

	/**
	 * Searches the compendiums for items and puts them in an array
	 * @param {JSON} json - JSON data from the Shadowdarklings.net site
	 * @returns {Array<ItemSD>}
	 */
	async _getGear(json) {
		const items = [];

		if (json.gear.length === 0) return items;

		await Promise.all(json.gear.map(async item => {
			for (let i = 1; i <= item.quantity; i++) {
				const armor = await this._findInCompendium(item.name, "shadowdark.armor");
				if (armor) items.push(armor);
				const weapon = await this._findInCompendium(item.name, "shadowdark.weapons");
				if (weapon) items.push(weapon);
				const basic = (item.name.includes("Caltrops"))
					? await this._findInCompendium("Caltrops", "shadowdark.basic-gear")
					: (item.name.includes("Flask"))
						? await this._findInCompendium("Flask", "shadowdark.basic-gear")
						: await this._findInCompendium(item.name, "shadowdark.basic-gear");
				if (basic) items.push(basic);
			}
		}));

		return items;
	}

	/**
	 * Parses JSON data from shadowdarklings and tries to create an Player actor from it.
	 * @param {JSON} json - JSON Data from the Shadowdarklings.net site
	 * @returns {ActorSD}
	 */
	async _importActor(json) {
		const importedActor = {
			name: json.name,
			type: "Player",
			system: {
				abilities: {
					str: {
						base: json.stats.STR,
						bonus: 0,
					},
					dex: {
						base: json.stats.DEX,
						bonus: 0,
					},
					con: {
						base: json.stats.CON,
						bonus: 0,
					},
					int: {
						base: json.stats.INT,
						bonus: 0,
					},
					wis: {
						base: json.stats.WIS,
						bonus: 0,
					},
					cha: {
						base: json.stats.CHA,
						bonus: 0,
					},
				},
				alignment: json.alignment.toLowerCase(),
				ancestry: json.ancestry,
				attributes: {
					hp: {
						value: json.maxHitPoints,
						max: json.maxHitPoints,
						base: (json.ancestry === "Dwarf") ? json.maxHitPoints - 2 : json.maxHitPoints,
					},
				},
				background: json.background,
				class: json.class.toLowerCase(),
				coins: {
					gp: json.gold,
					sp: json.silver,
					cp: json.copper,
				},
				deity: json.deity,
				languages: json.languages.toLowerCase().split(", "),
				level: {
					value: json.level,
					xp: 0,
				},
				slots: json.gearSlotsTotal,
				title: json.title,
				spellcastingAbility: this._getSpellCastingAbility(json.class.toLowerCase()),
			},
		};

		// Gear
		const items = await this._getGear(json);

		// Spells
		const spells = await Promise.all(
			json.bonuses.filter(b => b.name.includes("Spell:")).map(b => {
				return this._findInCompendium(b.bonusName, "shadowdark.spells");
			})
		);

		// Add spells granted from talents
		const talentSpells = await Promise.all(json.bonuses
			.filter(b => b.name === "LearnExtraSpell")
			.map(b => {
				return this._findInCompendium(
					b.bonusName, "shadowdark.spells"
				);
			})
		);
		if (talentSpells.length > 0) talentSpells.forEach(s => spells.push(s));

		// Spells & Bonuses
		const statBonus = {
			"STR:+1": "+1 to Strength",
			"DEX:+1": "+1 to Dexterity",
			"CON:+1": "+1 to Constitution",
			"INT:+1": "+1 to Intelligence",
			"WIS:+1": "+1 to Wisdom",
			"CHA:+1": "+1 to Charisma",
			"STR:+2": "+2 to Strength",
			"DEX:+2": "+2 to Dexterity",
			"CON:+2": "+2 to Constitution",
			"INT:+2": "+2 to Intelligence",
			"WIS:+2": "+2 to Wisdom",
			"CHA:+2": "+2 to Charisma",
		};

		const supportedTalents = [
			"LearnExtraSpell",
			"StatBonus",
			"WeaponMastery",
			"Grit",
			"ArmorMastery",
			"BackstabIncrease",
			"AdvOnInitiative",
			"Plus1ToHit",
			"Plus1ToHitAndDamage",
			"Plus1ToCastingSpells",
			"AdvOnCastOneSpell",
			"MakeRandomMagicItem",
			"SetWeaponTypeDamage",
			"ReduceHerbalismDC",
		];

		const talents = await Promise.all(json.bonuses.filter(
			b => supportedTalents.includes(b.name) || supportedTalents.includes(b.bonusName)
		).map(async bonus => {
			if (bonus.name === "LearnExtraSpell") {
				return this._findInCompendium("Learn Spell", "shadowdark.talents");
			}
			if (bonus.bonusName === "StatBonus") {
				// Keep running total of talent bonuses
				const ability = bonus.bonusTo.split(":")[0].toLowerCase();
				importedActor.system.abilities[ability].bonus +=
					parseInt(bonus.bonusTo.split("+")[1], 10);
				return this._findInCompendium(statBonus[bonus.bonusTo], "shadowdark.talents");
			}
			if (bonus.sourceCategory === "Talent" || bonus.sourceCategory === "Ability") {
				// Fighter
				if (bonus.name === "WeaponMastery") {
					return this._masteryTalent("weapon", bonus.bonusTo);
				}
				if (bonus.name === "Grit") {
					return this._findInCompendium(`Grit (${bonus.bonusName})`, "shadowdark.talents");
				}
				if (bonus.name === "ArmorMastery") {
					return this._masteryTalent("armor", bonus.bonusTo);
				}
				// Ranger
				if (bonus.name === "SetWeaponTypeDamage") {
					return this._damageDieD12Talent(bonus.bonusTo);
				}
				if (bonus.name === "ReduceHerbalismDC") {
					return this._findInCompendium("Reduced Herbalism DC", "shadowdark.talents");
				}
				if (bonus.name === "Plus1ToHitAndDamage") {
					if (bonus.bonusTo === "Melee attacks") {
						return this._findInCompendium("+1 to Melee Attacks and Damage", "shadowdark.talents");
					}
					if (bonus.bonusTo === "Ranged attacks") {
						return this._findInCompendium("+1 to Ranged Attacks and Damage", "shadowdark.talents");
					}
				}
				// Thief
				if (bonus.name === "BackstabIncrease") {
					return this._findInCompendium("Backstab +1 Damage Dice", "shadowdark.talents");
				}
				if (bonus.name === "AdvOnInitiative") {
					return this._findInCompendium("Initiative Advantage", "shadowdark.talents");
				}
				// Priest
				if (bonus.name === "Plus1ToHit") {
					if (bonus.bonusTo === "Melee and ranged attacks") bonus.bonusTo = `+1 to ${bonus.bonusTo}`;
					return this._findInCompendium(bonus.bonusTo, "shadowdark.talents");
				}
				// Wizard & Priest
				if (bonus.bonusName === "Plus1ToCastingSpells") {
					return this._findInCompendium("+1 on Spellcasting Checks", "shadowdark.talents");
				}
				if (bonus.name === "AdvOnCastOneSpell") {
					return this._spellCastingAdvantageTalent(bonus.bonusName);
				}
				// Wizard
				if (bonus.name === "MakeRandomMagicItem") {
					return this._findInCompendium("Make a Random Magic Item", "shadowdark.talents");
				}
			}
			return false;
		}));

		// Class talents
		if (json.class === "Thief") {
			talents.push(
				await this._findInCompendium("Backstab", "shadowdark.talents")
			);
			talents.push(
				await this._findInCompendium("Thievery", "shadowdark.talents")
			);
		}
		if (json.class === "Fighter") {
			talents.push(
				await this._findInCompendium("Hauler", "shadowdark.talents")
			);
		}
		if (json.class === "Ranger") {
			talents.push(
				await this._findInCompendium("Herbalism", "shadowdark.talents")
			);
			talents.push(
				await this._findInCompendium("Wayfinder", "shadowdark.talents")
			);
		}
		if (json.class === "Wizard") {
			talents.push(
				await this._findInCompendium("Magic Missile Advantage", "shadowdark.talents")
			);
		}
		if (json.priest === "Priest") {
			talents.push(
				await this._findInCompendium("Turn Undead", "shadowdark.talents")
			);
			spells.push(
				await this._findInCompendium("Turn Undead", "shadowdark.spells")
			);
		}

		// Ancestry talents
		if (json.ancestry === "Elf") {
			const farSight = json.bonuses.find(o => o.name === "FarSight");
			const bonus = (farSight.bonusTo === "RangedWeapons") ? "Farsight (Ranged)" : "Farsight (Spell)";
			talents.push(
				await this._findInCompendium(bonus, "shadowdark.talents")
			);
		}
		if (json.ancestry === "Kobold") {
			const knack = json.bonuses.find(o => o.name === "Knack");
			const bonus = (knack.bonusTo === "LuckTokenAtStartOfSession") ? "Knack (Luck)" : "Knack (Spellcasting)";
			talents.push(
				await this._findInCompendium(bonus, "shadowdark.talents")
			);
		}
		if (json.ancestry === "Half-Orc") {
			talents.push(
				await this._findInCompendium("Mighty", "shadowdark.talents")
			);
		}
		if (json.ancestry === "Halfling") {
			talents.push(
				await this._findInCompendium("Stealthy", "shadowdark.talents")
			);
		}
		if (json.ancestry === "Dwarf") {
			talents.push(
				await this._findInCompendium("Stout", "shadowdark.talents")
			);
		}
		if (json.ancestry === "Human") {
			talents.push(
				await this._findInCompendium("Ambitious", "shadowdark.talents")
			);
		}
		if (json.ancestry === "Goblin") {
			talents.push(
				await this._findInCompendium("Keen Senses", "shadowdark.talents")
			);
		}

		// Adjust the base ability values to take into account any bonuses
		// from talents
		for (const ability of CONFIG.SHADOWDARK.ABILITY_KEYS) {
			importedActor.system.abilities[ability].base -=
				importedActor.system.abilities[ability].bonus;

			// These are dynamically set by the ActiveEffects, so actually
			// need to be zero
			importedActor.system.abilities[ability].bonus = 0;
		}

		// Create the actor
		const newActor = await Actor.create(importedActor);
		await newActor.createEmbeddedDocuments("Item", [...spells, ...items, ...talents]);
		await newActor.items.filter(o => o.type === "Talent" && o.system.talentClass === "level").forEach(async talent => {
			talent.update({
				"system.level": 1,
			});
		});
		await newActor.update({
			"system.spellcastingAbility": newActor.getSpellcastingAbility(),
		});
		return newActor;
	}
}
