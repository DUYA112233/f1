import React, {useState} from "react";
import withTranslation from "next-translate/withTranslation";
import dayjs from "dayjs";
import dayjsutc from "dayjs/plugin/utc";
import dayjstimezone from "dayjs/plugin/timezone";
import {usePlausible} from "next-plausible";

const config = require(`../../_db/${process.env.NEXT_PUBLIC_SITE_KEY}/config.json`);

class Race extends React.Component {
	constructor(props) {
		super(props);

		dayjs.extend(dayjsutc);
		dayjs.extend(dayjstimezone);

		this.state = {
			collapsed: true
		};
	}

	handleRowClick() {
		if (this.props.item.sessions != null) {
			const plausible = usePlausible();

			plausible(!this.state.collapsed ? "Closed Event" : "Opened Event", {
				props: {
					event: this.props.item.slug
				}
			});

			this.setState({
				collapsed: !this.state.collapsed
			});
		}
	}

	componentDidMount() {
		this.setState({
			collapsed: true
		});
	}

	render() {
		const {t, lang} = this.props.i18n;
		const localeKey = "calendar:races." + this.props.item.localeKey;

		const hasMultipleFeaturedEvents = config.featuredSessions.length !== 1;
		
		function tbcBadge() {
			return (
				<span title={t("calendar:badges.tbc_title")} className="bg-yellow-400 rounded px-1 md:px-2 py-1 text-xxs sm:text-xs text-black font-normal sm:font-bold ml-2">
					{t(`calendar:badges.tbc`)}
				</span>
			);
		}
		
		function nextBadge() {
			return (
				<span className="bg-yellow-500 rounded px-1 md:px-2 py-1 text-xxs sm:text-xs text-black font-normal sm:font-bold ml-2">
					{t(`calendar:badges.next`)}
				</span>
			);
		}

		function badgeColumnLayout(props) {
			var badges = [];

			if (props.item.tbc) {
				badges.push(
					<span
						title={t("calendar:badges.tbc_title")}
						className="bg-yellow-400 rounded px-1 md:px-2 py-1 text-xs text-black font-bold ml-2"
					>
						{t("calendar:badges.tbc")}
					</span>
				);
			}

			if (props.item.canceled) {
				badges.push(
					<span className="bg-red-600 rounded px-1 md:px-2 py-1 text-xs text-black font-bold uppercase ml-2e">
						{t("calendar:badges.canceled")}
					</span>
				);
			}

			var sessionDate = dayjs();
			if (props.item.sessions != null) {
				if (hasMultipleFeaturedEvents) {
					let lastEventSessionKey = Object.keys(props.item.sessions)[
						Object.keys(props.item.sessions).length - 1
					];
					sessionDate = dayjs(props.item.sessions[lastEventSessionKey]);
				} else {
					sessionDate = dayjs(
						props.item.sessions[config.featuredSessions[0]]
					);
				}
			}

			if (props.item.affiliate) {
				if (props.item.tbc) {
					badges.push(
						<a
							href={props.item.affiliate}
							className="bg-green-600 rounded px-1 md:px-2 py-1 text-xs text-black font-bold uppercase hidden md:inline hover:bg-green-700 ml-2"
						>
							{t("calendar:badges.tickets")}
						</a>
					);
				} else {
					if (sessionDate.isAfter(dayjs())) {
						badges.push(
							<a
								href={props.item.affiliate}
								className="bg-green-600 rounded px-1 md:px-2 py-1 text-xs text-black font-bold uppercase hidden md:inline hover:bg-green-700 ml-2"
							>
								{t("calendar:badges.tickets")}
							</a>
						);
					} else {
						badges.push(
							<a
								href={props.item.affiliate}
								className="opacity-50 bg-green-600 rounded px-1 md:px-2 py-1 text-xs text-black font-bold uppercase hidden md:inline hover:bg-green-700 ml-2"
							>
								{t("calendar:badges.tickets")}
							</a>
						);
					}
				}
			}

			return badges;
		}

		var classes = "";
		if (this.props.index % 2 === 1) {
			classes += "rounded bg-row-gray ";
		}

		// Fade out TBC races a little
		if (this.props.item.tbc) {
			classes += "text-gray-300 ";
		}

		var titleRowClasses = "";

		// Highlight Next Race
		if (this.props.isNextRace) {
			titleRowClasses += "text-yellow-600 ";
		}

		// Strike out cancelled races
		if (this.props.item.canceled) {
			titleRowClasses += "line-through text-gray-300 ";
		}

		// Bold upcoming races
		let firstEventSessionKey = "";
		let lastEventSessionKey = "";

		if (this.props.item.sessions != null) {
			firstEventSessionKey = Object.keys(this.props.item.sessions)[0];

			lastEventSessionKey = Object.keys(this.props.item.sessions)[
				Object.keys(this.props.item.sessions).length - 1
			];
			if (
				!dayjs(this.props.item.sessions[lastEventSessionKey])
					.add(2, "hours")
					.isBefore() &&
				!this.props.item.canceled
			) {
				titleRowClasses += "font-semibold ";
			}

			// Strikethrough past races
			if (
				dayjs(this.props.item.sessions[lastEventSessionKey])
					.add(2, "hours")
					.isBefore(dayjs())
			) {
				classes += "line-through text-gray-400 ";
			} else {
				classes += "text-white ";
			}
		} else {
			classes += "text-white ";
		}

		return (
			<tbody
				id={this.props.item.slug}
				key={this.props.item.slug}
				className={`${classes}`}
			>
				{!hasMultipleFeaturedEvents ? (
					<tr
						key={this.props.item.slug}
						className="cursor-pointer"
						onClick={() => this.handleRowClick()}
					>
						<td className="py-5 pl-2 md:pl-3 w-6">
							{this.state.collapsed ? (
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 512 448"
									width="10"
									height="10"
								>
									<path
										fill="white"
										d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"
									/>
								</svg>
							) : (
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 448 512"
									width="10"
									height="10"
								>
									<path
										fill="white"
										d="M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z"
									/>
								</svg>
							)}
							<aria-hidden
								className={`${
									this.state.collapsed
										? "fas fa-caret-right fa-xs"
										: "fas fa-caret-down fa-xs"
								}`}
							/>
						</td>
						<td className={`w-6/12 sm:w-5/12 ${titleRowClasses} pl-2`}>
							{t(`calendar:races.${this.props.item.localeKey}`) !=
							localeKey
								? t(`calendar:races.${this.props.item.localeKey}`)
								: this.props.item.name}
							{this.props.isNextRace &&
								!this.props.item.tbc &&
								!this.props.item.canceled && (
									nextBadge()
								)}
								
							{this.props.item.tbc && (
								tbcBadge()
							)}
						</td>
						<td className={`w-2/12 ${titleRowClasses}`}>
							{this.props.item.sessions &&
								this.props.item.sessions[config.featuredSessions[0]] &&
								dayjs(
									this.props.item.sessions[config.featuredSessions[0]]
								)
									.tz(this.props.timezone)
									.format("D MMM")}
						</td>
						<td className={`w-2/12 ${titleRowClasses}`}>
							{this.props.item.sessions &&
								this.props.item.sessions[config.featuredSessions[0]] &&
								dayjs(
									this.props.item.sessions[config.featuredSessions[0]]
								)
									.tz(this.props.timezone)
									.format(
										this.props.timeFormat == 12 ? "h:mm A" : "HH:mm"
									)}
						</td>
						<td className="text-right w-0 sm:w-3/12 pr-2">
							{badgeColumnLayout(this.props)}
						</td>
					</tr>
				) : (
					<tr
						key={this.props.item.slug}
						className={`cursor-pointer ${titleRowClasses}`}
						onClick={() => this.handleRowClick()}
					>
						<td className="w-6 md:w-8 py-5 pl-2 md:pl-3">
							{this.state.collapsed ? (
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 512 448"
									width="10"
									height="10"
								>
									<path
										fill="white"
										d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"
									/>
								</svg>
							) : (
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 448 512"
									width="10"
									height="10"
								>
									<path
										fill="white"
										d="M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z"
									/>
								</svg>
							)}
							<aria-hidden
								className={`${
									this.state.collapsed
										? "fas fa-caret-right fa-xs"
										: "fas fa-caret-down fa-xs"
								}`}
							/>
						</td>
						<td className="w-1/2 pl-2">
							{t(`calendar:races.${this.props.item.localeKey}`) !==
							localeKey
								? t(`calendar:races.${this.props.item.localeKey}`)
								: this.props.item.name}
							{this.props.isNextRace &&
								!this.props.item.tbc &&
								!this.props.item.canceled && (
									nextBadge()
								)}
							{this.props.item.tbc && (
								tbcBadge()
							)}
						</td>
						<td className="text-right">
							{this.props.item.sessions &&
							dayjs(this.props.item.sessions[firstEventSessionKey])
								.tz(this.props.timezone)
								.format("D MMM") !=
								dayjs(this.props.item.sessions[lastEventSessionKey])
									.tz(this.props.timezone)
									.format("D MMM")
								? `${dayjs(
										this.props.item.sessions[firstEventSessionKey]
								  )
										.tz(this.props.timezone)
										.format("D MMM")} - ${dayjs(
										this.props.item.sessions[lastEventSessionKey]
								  )
										.tz(this.props.timezone)
										.format("D MMM")}`
								: `${dayjs(
										this.props.item.sessions[lastEventSessionKey]
								  )
										.tz(this.props.timezone)
										.format("D MMM")}`}
						</td>
						<td className="text-right w-0 sm:w-3/12 pr-2">
							{badgeColumnLayout(this.props)}
						</td>
					</tr>
				)}

				{config.collapsedSessions.map((item, index) => {
					if (
						this.props.item.sessions != null &&
						this.props.item.sessions[item]
					) {
						return (
							<RaceTR
								date={this.props.item.sessions[item]}
								title={item}
								timezone={this.props.timezone}
								timeFormat={this.props.timeFormat}
								i18n={this.props.i18n}
								localeKey={this.props.item.localeKey}
								collapsed={this.state.collapsed}
								hasMultipleFeaturedEvents={hasMultipleFeaturedEvents}
							/>
						);
					}
				})}
			</tbody>
		);
	}
}

class RaceTR extends React.Component {
	render() {
		const {t, lang} = this.props.i18n;

		if (lang === "en") {
			dayjs.locale(this.props.locale);
		} else {
			dayjs.locale(lang);
		}

		const hasMultipleFeaturedEvents = this.props.hasMultipleFeaturedEvents;
		const titleKey = "calendar:schedule." + this.props.title;

		if (hasMultipleFeaturedEvents) {
			var blankColumnCount = config.featuredSessions.length - 1;

			return (
				<tr className={`${this.props.collapsed ? "hidden" : ""}`}>
					<td className="w-1/8"></td>
					<td className="w-1/2 py-4 pl-2">{t(titleKey)}</td>
					<td className="w-1/3 text-right">
						{dayjs(this.props.date)
							.tz(this.props.timezone)
							.format(
								this.props.timeFormat == 12
									? "D MMM h:mm A"
									: "D MMM HH:mm"
							)}
					</td>
					<td />
				</tr>
			);
		} else {
			return (
				<tr className={`${this.props.collapsed ? "hidden" : ""}`} key={this.props.localeKey}>
					<td className="w-1/8"></td>
					<td className="w-1/2 py-4 pl-2">{t(titleKey)}</td>
					<td className="w-1/6">
						{dayjs(this.props.date)
							.tz(this.props.timezone)
							.format("D MMM")}
					</td>
					<td className="w-1/6">
						{dayjs(this.props.date)
							.tz(this.props.timezone)
							.format(this.props.timeFormat == 12 ? "h:mm A" : "HH:mm")}
					</td>
					<td />
				</tr>
			);
		}
	}
}

export default withTranslation(Race);
