import React, {Component} from "react";
import withTranslation from "next-translate/withTranslation";
import i18nConfig from "../../i18n.json";
import Router from "next/router";
import {usePlausible} from "next-plausible";

class LanguageSelector extends React.Component {
	onChange = (event) => {
		if (event.target.value === "add") {
			document.location.href =
				"https://github.com/sportstimes/f1/tree/main/locales";
			return;
		}

		let adjustedURL = Router.pathname;

		if (
			this.props != null &&
			this.props.i18n != null &&
			this.props.i18n.lang != null
		) {
			adjustedURL = adjustedURL.replace("/" + this.props.i18n.lang, "");
		}

		if (adjustedURL == "") {
			adjustedURL = "/";
		}

		if (adjustedURL.includes("[timezone]")) {
			adjustedURL = "/timezones/";
		}

		Router.push(adjustedURL, adjustedURL, {locale: event.target.value});

		const plausible = usePlausible();

		plausible("Changed Language", {
			props: {
				language: event.target.value
			}
		});
	};

	render() {
		const {t, lang} = this.props.i18n;
		const title = t(process.env.NEXT_PUBLIC_SITE_KEY + `:title`);

		const {languageNames} = i18nConfig;

		// Picker Items
		const languageItems = [];

		for (const language in languageNames) {
			languageItems.push(
				<option value={language} key={language}>
					{languageNames[language]}
				</option>
			);
		}

		languageItems.push(
			<option value="add" key="Add">
				{t("common:contribute")} +
			</option>
		);

		return (
			<div>
				<label htmlFor="languageSelector" className="sr-only">
					{t("common:languageSelector")}
				</label>
				<select
					id="languageSelector"
					name="language"
					value={lang}
					onChange={this.onChange}
					value={lang}
					className="mx-2 text-gray-900 pl-3 pr-10 py-0 text-base
					border-gray-300 focus:outline-none focus:ring-indigo-500
					focus:border-indigo-500 sm:text-sm rounded-md"
				>
					{languageItems}
				</select>
			</div>
		);
	}
}

export default withTranslation(LanguageSelector);
