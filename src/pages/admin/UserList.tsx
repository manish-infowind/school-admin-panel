import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    User,
    Smartphone,
    Plus,
    Mail,
    Pencil,
    Trash,
    Eye,
    Search,
    ArrowDown,
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import CreateUserModal from "@/components/admin/CreateUserModal";
import { CreateUserRequest } from "@/api";
import { DeleteConfirmationModal } from "@/components/admin/DeleteConfirmationModal";
import { Input } from "@/components/ui/input";
import PaginationControls from "@/components/ui/paginationComp";
import SortableHeader from "@/components/ui/tableSorting";


// Table Static / Mock Data 
const tableConfig = [
    { label: "Name", sortKey: "name" },
    { label: "Status", sortKey: "isActive" },
    { label: "Contact No.", sortKey: "contact" },
    { label: "Email", sortKey: "email" },
    { label: "Profile Score", sortKey: "profileScore" },
    { label: "Gender", sortKey: "gender" },
    { label: "City", sortKey: "city" },
    { label: "Actions", sortKey: null },
];
const getUserList = [{ "id": 1, "name": "Staford Ashburne", "isActive": false, "status": "Ms", "contact": "182-484-2647", "email": "sashburne0@paginegialle.it", "profileScore": "DE", "gender": "Male", "city": "Santiago" },
{ "id": 2, "name": "Alexandros Petruskevich", "isActive": true, "status": "Ms", "contact": "904-758-8495", "email": "apetruskevich1@amazon.co.jp", "profileScore": "LU", "gender": "Male", "city": "Paris La Défense" },
{ "id": 3, "name": "Amalie Caesman", "isActive": false, "status": "Mr", "contact": "934-241-0757", "email": "acaesman2@opera.com", "profileScore": "US", "gender": "Female", "city": "Czernikowo" },
{ "id": 4, "name": "Claudine Weippert", "isActive": false, "status": "Mr", "contact": "506-732-2862", "email": "cweippert3@theguardian.com", "profileScore": "LU", "gender": "Female", "city": "Sonta" },
{ "id": 5, "name": "Nicolai Feldmesser", "isActive": true, "status": "Dr", "contact": "407-753-7500", "email": "nfeldmesser4@senate.gov", "profileScore": "IT", "gender": "Male", "city": "Azogues" },
{ "id": 6, "name": "Dorree Vanyushkin", "isActive": true, "status": "Mrs", "contact": "868-915-2174", "email": "dvanyushkin5@berkeley.edu", "profileScore": "US", "gender": "Female", "city": "Jelah" },
{ "id": 7, "name": "Iosep Aloigi", "isActive": true, "status": "Rev", "contact": "364-469-4866", "email": "ialoigi6@ask.com", "profileScore": "NL", "gender": "Male", "city": "Liloan" },
{ "id": 8, "name": "Stafani Wonter", "isActive": true, "status": "Mrs", "contact": "644-873-7057", "email": "swonter7@sfgate.com", "profileScore": "DE", "gender": "Female", "city": "Guri i Zi" },
{ "id": 9, "name": "Dominick Climo", "isActive": true, "status": "Mr", "contact": "570-896-2538", "email": "dclimo8@dedecms.com", "profileScore": "AT", "gender": "Male", "city": "Junglinster" },
{ "id": 10, "name": "Savina Willarton", "isActive": false, "status": "Rev", "contact": "685-799-4916", "email": "swillarton9@surveymonkey.com", "profileScore": "US", "gender": "Female", "city": "Rifu" },
{ "id": 11, "name": "Frasier Brade", "isActive": true, "status": "Mr", "contact": "705-665-4616", "email": "fbradea@rakuten.co.jp", "profileScore": "US", "gender": "Male", "city": "Chidian" },
{ "id": 12, "name": "Jasun Fyldes", "isActive": true, "status": "Honorable", "contact": "317-280-8318", "email": "jfyldesb@dmoz.org", "profileScore": "US", "gender": "Male", "city": "Almeria" },
{ "id": 13, "name": "Amberly Matiashvili", "isActive": false, "status": "Ms", "contact": "779-655-0239", "email": "amatiashvilic@fema.gov", "profileScore": "IT", "gender": "Female", "city": "Lazdijai" },
{ "id": 14, "name": "Dyann Zavattari", "isActive": false, "status": "Ms", "contact": "548-545-5576", "email": "dzavattarid@senate.gov", "profileScore": "US", "gender": "Female", "city": "Chauk" },
{ "id": 15, "name": "Billie Trevena", "isActive": true, "status": "Honorable", "contact": "773-696-8598", "email": "btrevenae@blogger.com", "profileScore": "US", "gender": "Male", "city": "Simitli" },
{ "id": 16, "name": "Peyton Attenbarrow", "isActive": false, "status": "Ms", "contact": "218-798-9406", "email": "pattenbarrowf@ocn.ne.jp", "profileScore": "AT", "gender": "Male", "city": "Zavidovo" },
{ "id": 17, "name": "Tito Axelbee", "isActive": true, "status": "Rev", "contact": "229-801-1707", "email": "taxelbeeg@github.com", "profileScore": "US", "gender": "Male", "city": "Beslan" },
{ "id": 18, "name": "Tanny Hattigan", "isActive": false, "status": "Mrs", "contact": "182-681-4838", "email": "thattiganh@whitehouse.gov", "profileScore": "US", "gender": "Male", "city": "Nunleu" },
{ "id": 19, "name": "Rubia Stockney", "isActive": false, "status": "Mrs", "contact": "253-641-7674", "email": "rstockneyi@marriott.com", "profileScore": "US", "gender": "Female", "city": "Fagersta" },
{ "id": 20, "name": "Keelby Copozio", "isActive": true, "status": "Rev", "contact": "313-664-5378", "email": "kcopozioj@smugmug.com", "profileScore": "FI", "gender": "Male", "city": "Jiucheng" },
{ "id": 21, "name": "Damita Crumpe", "isActive": true, "status": "Dr", "contact": "867-249-4806", "email": "dcrumpek@google.es", "profileScore": "FR", "gender": "Female", "city": "Sovetsk" },
{ "id": 22, "name": "Letti Vigus", "isActive": false, "status": "Rev", "contact": "202-511-1115", "email": "lvigusl@webnode.com", "profileScore": "DE", "gender": "Female", "city": "Washington" },
{ "id": 23, "name": "Peterus Hounihan", "isActive": false, "status": "Rev", "contact": "348-545-7227", "email": "phounihanm@sun.com", "profileScore": "US", "gender": "Male", "city": "Fangbu" },
{ "id": 24, "name": "Ruddy McGiffin", "isActive": true, "status": "Dr", "contact": "803-301-3843", "email": "rmcgiffinn@com.com", "profileScore": "FR", "gender": "Male", "city": "Muarasiau" },
{ "id": 25, "name": "Clayson Gyurko", "isActive": true, "status": "Mrs", "contact": "541-595-8110", "email": "cgyurkoo@mapy.cz", "profileScore": "IE", "gender": "Male", "city": "Pengandonan" },
{ "id": 26, "name": "Melinda Duffet", "isActive": true, "status": "Dr", "contact": "920-927-2796", "email": "mduffetp@drupal.org", "profileScore": "US", "gender": "Female", "city": "Cruzeiro" },
{ "id": 27, "name": "Brewster Vaney", "isActive": false, "status": "Rev", "contact": "862-167-3593", "email": "bvaneyq@fotki.com", "profileScore": "US", "gender": "Male", "city": "Vale de Vila" },
{ "id": 28, "name": "Udall Rayner", "isActive": true, "status": "Ms", "contact": "934-983-1516", "email": "uraynerr@ning.com", "profileScore": "DE", "gender": "Male", "city": "Angered" },
{ "id": 29, "name": "Coleman Sherborne", "isActive": false, "status": "Mr", "contact": "963-245-8513", "email": "csherbornes@home.pl", "profileScore": "US", "gender": "Male", "city": "Bonak" },
{ "id": 30, "name": "Melvyn Formilli", "isActive": false, "status": "Dr", "contact": "504-251-4150", "email": "mformillit@auda.org.au", "profileScore": "FI", "gender": "Male", "city": "Cimanggu" },
{ "id": 31, "name": "Ashley Gammell", "isActive": true, "status": "Honorable", "contact": "312-779-8445", "email": "agammellu@china.com.cn", "profileScore": "US", "gender": "Male", "city": "Paris 05" },
{ "id": 32, "name": "Prince Martyn", "isActive": false, "status": "Ms", "contact": "421-991-1721", "email": "pmartynv@jalbum.net", "profileScore": "US", "gender": "Male", "city": "Mâcon" },
{ "id": 33, "name": "Xaviera Evison", "isActive": true, "status": "Honorable", "contact": "163-220-6879", "email": "xevisonw@whitehouse.gov", "profileScore": "US", "gender": "Female", "city": "Meilin" },
{ "id": 34, "name": "Lemar Richt", "isActive": true, "status": "Mr", "contact": "777-159-9389", "email": "lrichtx@biblegateway.com", "profileScore": "IT", "gender": "Male", "city": "Santa Cruz de Yojoa" },
{ "id": 35, "name": "Dona Paliser", "isActive": true, "status": "Ms", "contact": "562-153-1649", "email": "dpalisery@apple.com", "profileScore": "NL", "gender": "Female", "city": "Mengdadazhuang" },
{ "id": 36, "name": "Ermina Awmack", "isActive": false, "status": "Honorable", "contact": "236-453-3398", "email": "eawmackz@dmoz.org", "profileScore": "US", "gender": "Female", "city": "Tubalan" },
{ "id": 37, "name": "Gerri Sendley", "isActive": false, "status": "Ms", "contact": "655-650-7938", "email": "gsendley10@youtu.be", "profileScore": "US", "gender": "Female", "city": "Henghe" },
{ "id": 38, "name": "Bailey Kelf", "isActive": false, "status": "Mr", "contact": "359-993-9502", "email": "bkelf11@cbc.ca", "profileScore": "US", "gender": "Male", "city": "Cengjia" },
{ "id": 39, "name": "Ferrell Kippie", "isActive": false, "status": "Mrs", "contact": "207-867-7297", "email": "fkippie12@smh.com.au", "profileScore": "IT", "gender": "Male", "city": "Wentang" },
{ "id": 40, "name": "Ralf Dobbins", "isActive": false, "status": "Mr", "contact": "490-540-6298", "email": "rdobbins13@abc.net.au", "profileScore": "IT", "gender": "Male", "city": "Rudnogorsk" },
{ "id": 41, "name": "Lemmy Brower", "isActive": true, "status": "Ms", "contact": "121-191-2188", "email": "lbrower14@theatlantic.com", "profileScore": "US", "gender": "Male", "city": "Babakansari" },
{ "id": 42, "name": "Jandy Deal", "isActive": false, "status": "Dr", "contact": "139-697-9184", "email": "jdeal15@umn.edu", "profileScore": "SE", "gender": "Female", "city": "Morelos" },
{ "id": 43, "name": "Elroy Stollmeier", "isActive": false, "status": "Mr", "contact": "307-281-5240", "email": "estollmeier16@harvard.edu", "profileScore": "US", "gender": "Male", "city": "Riga" },
{ "id": 44, "name": "Laurens Vossing", "isActive": true, "status": "Honorable", "contact": "818-654-0461", "email": "lvossing17@imageshack.us", "profileScore": "IT", "gender": "Male", "city": "Zunilito" },
{ "id": 45, "name": "Jacquelin Ludlamme", "isActive": true, "status": "Dr", "contact": "394-113-8909", "email": "jludlamme18@tmall.com", "profileScore": "FR", "gender": "Female", "city": "Aldeia" },
{ "id": 46, "name": "Dacia Peacock", "isActive": true, "status": "Ms", "contact": "387-657-0590", "email": "dpeacock19@hud.gov", "profileScore": "US", "gender": "Female", "city": "San Isidro" },
{ "id": 47, "name": "Renaldo Lannon", "isActive": true, "status": "Honorable", "contact": "964-270-0109", "email": "rlannon1a@cocolog-nifty.com", "profileScore": "FR", "gender": "Male", "city": "Caotang" },
{ "id": 48, "name": "Conny Guilloud", "isActive": false, "status": "Mrs", "contact": "649-220-8971", "email": "cguilloud1b@harvard.edu", "profileScore": "US", "gender": "Female", "city": "Capiíbary" },
{ "id": 49, "name": "Christoph Hall-Gough", "isActive": false, "status": "Rev", "contact": "976-410-3451", "email": "challgough1c@technorati.com", "profileScore": "ES", "gender": "Male", "city": "Chaiyo" },
{ "id": 50, "name": "Byrann Storer", "isActive": false, "status": "Rev", "contact": "749-137-5194", "email": "bstorer1d@ft.com", "profileScore": "US", "gender": "Male", "city": "Ccuntuma" },
{ "id": 51, "name": "Jana De Cristoforo", "isActive": false, "status": "Rev", "contact": "517-991-0323", "email": "jde1e@mysql.com", "profileScore": "US", "gender": "Female", "city": "Dasol" },
{ "id": 52, "name": "Francesca Carbery", "isActive": false, "status": "Mr", "contact": "503-160-4649", "email": "fcarbery1f@boston.com", "profileScore": "US", "gender": "Female", "city": "Zhichu" },
{ "id": 53, "name": "Marquita Kemmis", "isActive": true, "status": "Rev", "contact": "210-131-9030", "email": "mkemmis1g@baidu.com", "profileScore": "BE", "gender": "Female", "city": "Longxian" },
{ "id": 54, "name": "Arnold Nutley", "isActive": true, "status": "Dr", "contact": "900-344-0258", "email": "anutley1h@digg.com", "profileScore": "US", "gender": "Male", "city": "Zel’va" },
{ "id": 55, "name": "Simone Richard", "isActive": true, "status": "Dr", "contact": "311-875-4258", "email": "srichard1i@webnode.com", "profileScore": "US", "gender": "Female", "city": "Nacka" },
{ "id": 56, "name": "Tandie Caban", "isActive": true, "status": "Dr", "contact": "715-731-6693", "email": "tcaban1j@imageshack.us", "profileScore": "AT", "gender": "Female", "city": "Zerkten" },
{ "id": 57, "name": "Conrado Ollis", "isActive": false, "status": "Honorable", "contact": "324-818-5338", "email": "collis1k@oaic.gov.au", "profileScore": "US", "gender": "Male", "city": "San Lucas" },
{ "id": 58, "name": "Leeanne Preon", "isActive": false, "status": "Honorable", "contact": "613-844-4265", "email": "lpreon1l@github.io", "profileScore": "IT", "gender": "Female", "city": "Venâncio Aires" },
{ "id": 59, "name": "Christel Hehir", "isActive": true, "status": "Mr", "contact": "278-207-5242", "email": "chehir1m@kickstarter.com", "profileScore": "US", "gender": "Female", "city": "Jingmao" },
{ "id": 60, "name": "Jacky Shuter", "isActive": false, "status": "Dr", "contact": "173-916-5932", "email": "jshuter1n@chron.com", "profileScore": "US", "gender": "Male", "city": "Quma" },
{ "id": 61, "name": "Karylin Ralestone", "isActive": true, "status": "Mr", "contact": "725-250-9954", "email": "kralestone1o@reuters.com", "profileScore": "IT", "gender": "Female", "city": "Nyaunglebin" },
{ "id": 62, "name": "Tamiko Sinfield", "isActive": true, "status": "Rev", "contact": "928-755-7318", "email": "tsinfield1p@weather.com", "profileScore": "NL", "gender": "Female", "city": "Alto do Estanqueiro" },
{ "id": 63, "name": "Janice Bortoluzzi", "isActive": true, "status": "Ms", "contact": "470-718-0746", "email": "jbortoluzzi1q@ucla.edu", "profileScore": "US", "gender": "Female", "city": "Antonio Toledo Corro" },
{ "id": 64, "name": "Carie McShirie", "isActive": true, "status": "Dr", "contact": "142-902-0592", "email": "cmcshirie1r@google.ca", "profileScore": "IT", "gender": "Female", "city": "Orito" },
{ "id": 65, "name": "Chaddie Mix", "isActive": true, "status": "Ms", "contact": "819-195-3192", "email": "cmix1s@si.edu", "profileScore": "DE", "gender": "Male", "city": "Wujiaying" },
{ "id": 66, "name": "Alix Kilmurray", "isActive": false, "status": "Mr", "contact": "638-475-0222", "email": "akilmurray1t@goodreads.com", "profileScore": "LU", "gender": "Female", "city": "Gevgelija" },
{ "id": 67, "name": "Edlin Heild", "isActive": false, "status": "Dr", "contact": "245-173-3939", "email": "eheild1u@hostgator.com", "profileScore": "US", "gender": "Male", "city": "Peña Blanca" },
{ "id": 68, "name": "Clarisse Vasechkin", "isActive": false, "status": "Ms", "contact": "925-969-2970", "email": "cvasechkin1v@fda.gov", "profileScore": "IT", "gender": "Female", "city": "Kaliuda" },
{ "id": 69, "name": "Brander Dukes", "isActive": false, "status": "Rev", "contact": "960-651-2728", "email": "bdukes1w@wix.com", "profileScore": "US", "gender": "Male", "city": "Beijie" },
{ "id": 70, "name": "Nichol Couzens", "isActive": true, "status": "Honorable", "contact": "352-205-9860", "email": "ncouzens1x@nytimes.com", "profileScore": "AT", "gender": "Female", "city": "Ugbokpo" },
{ "id": 71, "name": "Neill Leggs", "isActive": false, "status": "Ms", "contact": "315-808-6748", "email": "nleggs1y@tripadvisor.com", "profileScore": "US", "gender": "Male", "city": "Kufa" },
{ "id": 72, "name": "Colman Hackforth", "isActive": true, "status": "Dr", "contact": "399-853-4823", "email": "chackforth1z@yandex.ru", "profileScore": "US", "gender": "Male", "city": "Piripiri" },
{ "id": 73, "name": "Marlin Howerd", "isActive": true, "status": "Rev", "contact": "293-100-0863", "email": "mhowerd20@ehow.com", "profileScore": "DK", "gender": "Male", "city": "Pa Phayom" },
{ "id": 74, "name": "Maritsa Fladgate", "isActive": true, "status": "Honorable", "contact": "619-810-7881", "email": "mfladgate21@nyu.edu", "profileScore": "US", "gender": "Female", "city": "Caen" },
{ "id": 75, "name": "Payton Fownes", "isActive": true, "status": "Ms", "contact": "388-891-1223", "email": "pfownes22@surveymonkey.com", "profileScore": "US", "gender": "Male", "city": "Prachatice" },
{ "id": 76, "name": "Damon Fochs", "isActive": false, "status": "Rev", "contact": "594-338-0301", "email": "dfochs23@sbwire.com", "profileScore": "US", "gender": "Male", "city": "Sabang" },
{ "id": 77, "name": "Judye Lassetter", "isActive": true, "status": "Ms", "contact": "722-883-6165", "email": "jlassetter24@mashable.com", "profileScore": "US", "gender": "Female", "city": "Envigado" },
{ "id": 78, "name": "Antone MacClenan", "isActive": true, "status": "Honorable", "contact": "881-656-3465", "email": "amacclenan25@themeforest.net", "profileScore": "US", "gender": "Male", "city": "Vales" },
{ "id": 79, "name": "Ewart Kleinzweig", "isActive": true, "status": "Mrs", "contact": "164-489-6952", "email": "ekleinzweig26@cbslocal.com", "profileScore": "IE", "gender": "Male", "city": "Mar del Plata" },
{ "id": 80, "name": "Vic Di Bernardo", "isActive": false, "status": "Mr", "contact": "204-116-3935", "email": "vdi27@loc.gov", "profileScore": "DE", "gender": "Male", "city": "La Joya" },
{ "id": 81, "name": "Teddi Walenta", "isActive": true, "status": "Ms", "contact": "469-510-7099", "email": "twalenta28@miitbeian.gov.cn", "profileScore": "US", "gender": "Female", "city": "Belogorsk" },
{ "id": 82, "name": "Ozzie Wortley", "isActive": true, "status": "Mrs", "contact": "483-343-6934", "email": "owortley29@pagesperso-orange.fr", "profileScore": "US", "gender": "Male", "city": "Néa Ionía" },
{ "id": 83, "name": "Horst McPartlin", "isActive": false, "status": "Rev", "contact": "115-115-7640", "email": "hmcpartlin2a@sphinn.com", "profileScore": "US", "gender": "Male", "city": "Port-à-Piment" },
{ "id": 84, "name": "Florina Chaplin", "isActive": true, "status": "Rev", "contact": "108-756-6618", "email": "fchaplin2b@rediff.com", "profileScore": "IE", "gender": "Female", "city": "Lapai" },
{ "id": 85, "name": "Sheilah Rait", "isActive": false, "status": "Dr", "contact": "839-678-8520", "email": "srait2c@paginegialle.it", "profileScore": "LT", "gender": "Female", "city": "La Esperanza" },
{ "id": 86, "name": "Prentice Schruyer", "isActive": false, "status": "Rev", "contact": "282-164-1960", "email": "pschruyer2d@goodreads.com", "profileScore": "IT", "gender": "Male", "city": "Saint John’s" },
{ "id": 87, "name": "York Gatward", "isActive": false, "status": "Ms", "contact": "302-697-1801", "email": "ygatward2e@sogou.com", "profileScore": "US", "gender": "Male", "city": "Morazán" },
{ "id": 88, "name": "Hastie Stearley", "isActive": false, "status": "Mrs", "contact": "524-362-1402", "email": "hstearley2f@chron.com", "profileScore": "US", "gender": "Male", "city": "Frederiksberg" },
{ "id": 89, "name": "Leda Cristou", "isActive": false, "status": "Dr", "contact": "636-703-1769", "email": "lcristou2g@pagesperso-orange.fr", "profileScore": "US", "gender": "Female", "city": "Catbalogan" },
{ "id": 90, "name": "Even Pirot", "isActive": true, "status": "Mr", "contact": "258-983-6762", "email": "epirot2h@wired.com", "profileScore": "DE", "gender": "Male", "city": "Matingain" },
{ "id": 91, "name": "Lucretia Limb", "isActive": true, "status": "Honorable", "contact": "719-249-9293", "email": "llimb2i@drupal.org", "profileScore": "US", "gender": "Female", "city": "Sablé-sur-Sarthe" },
{ "id": 92, "name": "Nikita Eads", "isActive": false, "status": "Mrs", "contact": "648-791-5608", "email": "neads2j@kickstarter.com", "profileScore": "DE", "gender": "Male", "city": "Cilampuyang" },
{ "id": 93, "name": "Henriette Thunder", "isActive": false, "status": "Rev", "contact": "940-231-7057", "email": "hthunder2k@google.co.jp", "profileScore": "US", "gender": "Female", "city": "Sorongan" },
{ "id": 94, "name": "Letty Whild", "isActive": true, "status": "Mrs", "contact": "435-599-2002", "email": "lwhild2l@list-manage.com", "profileScore": "US", "gender": "Female", "city": "Minyat an Naşr" },
{ "id": 95, "name": "Avigdor Rathke", "isActive": true, "status": "Rev", "contact": "472-623-7384", "email": "arathke2m@dedecms.com", "profileScore": "US", "gender": "Male", "city": "Oslo" },
{ "id": 96, "name": "Torin Stuchbury", "isActive": true, "status": "Dr", "contact": "264-839-7432", "email": "tstuchbury2n@mac.com", "profileScore": "US", "gender": "Male", "city": "Kasangulu" },
{ "id": 97, "name": "Quintus Nuemann", "isActive": false, "status": "Rev", "contact": "242-245-3623", "email": "qnuemann2o@homestead.com", "profileScore": "US", "gender": "Male", "city": "Labruge" },
{ "id": 98, "name": "Siward Kilgannon", "isActive": false, "status": "Rev", "contact": "392-488-0446", "email": "skilgannon2p@elpais.com", "profileScore": "US", "gender": "Male", "city": "Mogzon" },
{ "id": 99, "name": "Corby Pendrey", "isActive": true, "status": "Dr", "contact": "884-961-0646", "email": "cpendrey2q@github.com", "profileScore": "IT", "gender": "Male", "city": "Laolong" },
{ "id": 100, "name": "Kandace Ivanisov", "isActive": true, "status": "Mr", "contact": "985-540-7743", "email": "kivanisov2r@mail.ru", "profileScore": "US", "gender": "Female", "city": "Ferreñafe" }];


const UsersList = () => {
    const { toast } = useToast();
    const originalUserList = useMemo(() => getUserList, []);

    const [userList, setUserList] = useState(originalUserList);
    const [filteredList, setFilteredList] = useState(originalUserList);
    const [deleteUser, setDeleteUser] = useState(null);

    const [loading, setLoading] = useState(false);
    const [createUserOpen, setCreateUserOpen] = useState(false);
    const [editable, setEditable] = useState(false);
    const [showButtons, setShowButtons] = useState(false);
    const [deleteItemType, setDeleteItemType] = useState(false);
    const [addEditUserFlag, setAddEditUserFlag] = useState(false);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: '', direction: 'asc' });

    const [searchText, setsearchText] = useState("");
    const [formData, setFormData] = useState({});

    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const pageSizeOptions = [10, 20, 50];

    const totalItems = filteredList.length;
    const totalPages = Math.ceil(totalItems / pageSize);

    // Reset to page 1 when pageSize changes
    useEffect(() => {
        setCurrentPage(1);
    }, [pageSize, filteredList.length]);


    // User Dialog Handlers
    const openUserModal = useCallback(async () => {
        setCreateUserOpen(true);
        setShowButtons(false);
        setAddEditUserFlag(false);
        setEditable(false);
        handleClearForm();
    }, []);

    const closeUserModal = useCallback(async () => {
        setCreateUserOpen(false);
        setEditable(false);
        setAddEditUserFlag(false);
        setShowButtons(false);
    }, []);


    // Onchange Handlers - Form Inputs
    const handleInputChange = useCallback(async (field: keyof CreateUserRequest, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    // Save User Handlers - Add Button
    const handleSubmit = useCallback(async (e: React.FormEvent,) => {
        e.preventDefault();
        console.log('Update User data successfully:', formData);

        toast({
            title: addEditUserFlag ? "User Updated" : "User Created",
            description: "Operation completed successfully.",
        });

        setAddEditUserFlag(false);
        closeUserModal();
        handleClearForm();
    }, [formData, addEditUserFlag, closeUserModal, toast]);


    // Edit User Handlers - Edit/Eye Button
    const handleViewList = useCallback((user?: typeof getUserList[number], type?: string) => {
        setAddEditUserFlag(true);
        setDeleteUser(user);
        setCreateUserOpen(true);
        setEditable(type === 'view');
        setShowButtons(type === 'view');
        setFormData({
            userName: user?.name || "",
            isActive: user?.isActive || false,
            contactNumber: user?.contact || "",
            email: user?.email || "",
            profileScore: user?.profileScore || "",
            gender: user?.gender?.toLocaleLowerCase() || "",
            city: user?.city || "",
        });
    }, []);


    // Update User Handlers - Edit/Eye Button
    const handleUpdateList = useCallback(() => {
        setEditable(prev => !prev);
    }, []);


    // Delete User Handlers - Trash Button
    const openDeleteDialog = useCallback((user?: typeof getUserList[number]) => {
        setDeleteUser(user);
        setDeleteItemType(true);
        setCreateUserOpen(false);
    }, []);

    const closeDeleteDialog = useCallback(() => {
        setDeleteItemType(false);
        setDeleteUser(null);
    }, []);

    const handleDeleteList = useCallback(() => {
        const updatedList = userList.filter(item => item.name !== deleteUser.name);
        setUserList(updatedList);
        setFilteredList(updatedList);
        setDeleteItemType(false);
        setDeleteUser(null);
        toast({
            title: "User Deleted",
            description: `${deleteUser.name} has been deleted.`,
            variant: "destructive",
        });
    }, [deleteUser, originalUserList]);


    // Search Handlers
    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toLowerCase();
        setsearchText(value);

        const filtered = value
            ? originalUserList.filter(user =>
                Object.values(user).some(val =>
                    val?.toString().toLowerCase().includes(value)
                )
            )
            : originalUserList;

        setFilteredList(filtered);
        setSortConfig({ key: '', direction: 'asc' }); // Reset sorting on search
        setCurrentPage(1); // Optional: reset to first page
    }, []);


    // Clear form
    const handleClearForm = useCallback(() => {
        setEditable(false);
        setShowButtons(false);
        setAddEditUserFlag(false);
        setFormData({});
    }, []);


    // Paginations - Memoized current page data
    // const currentData = useMemo(() => {
    //     const start = (currentPage - 1) * pageSize;
    //     const end = start + pageSize;
    //     return filteredList.slice(start, end);
    // }, [filteredList, currentPage, pageSize]);

    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    // Pagination helpers
    const handlePageChange = useCallback((page: number) => {
        if (page >= 1 && page <= totalPages && page !== currentPage) {
            setCurrentPage(page);
        }
    }, [currentPage, totalPages]);

    const handlePageSizeChange = useCallback((size: number) => {
        setPageSize(size);
    }, []);


    // Visible pages logic (unchanged)
    const visiblePages = useMemo(() => {
        const pages: (number | string)[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('...');
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) pages.push(i);
            if (currentPage < totalPages - 2) pages.push('...');
            if (totalPages > 1) pages.push(totalPages);
        }
        return pages;
    }, [currentPage, totalPages]);


    // Apply sorting if active
    const sortedAndPaginatedData = useMemo(() => {
        let data = [...filteredList];

        // Apply sorting
        if (sortConfig.key) {
            data.sort((a, b) => {
                const aVal = a[sortConfig.key as keyof typeof a];
                const bVal = b[sortConfig.key as keyof typeof b];

                if (aVal == null) return 1;
                if (bVal == null) return -1;

                if (typeof aVal === 'string' && typeof bVal === 'string') {
                    return sortConfig.direction === 'asc'
                        ? aVal.localeCompare(bVal)
                        : bVal.localeCompare(aVal);
                }

                return sortConfig.direction === 'asc'
                    ? aVal > bVal ? 1 : -1
                    : aVal < bVal ? 1 : -1;
            });
        }

        // Apply pagination
        const start = (currentPage - 1) * pageSize;
        return data.slice(start, start + pageSize);
    }, [filteredList, sortConfig, currentPage, pageSize]);

    const handleSort = useCallback((key: string) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    }, []);


    return (
        <div className="space-y-6">
            {/* Header & Search */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-green via-brand-teal to-brand-blue bg-clip-text text-transparent">
                            User List Management
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Arrange User listings and information
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                className="pl-10 w-80"
                                placeholder="Search any name, number, email, city..."
                                value={searchText}
                                onChange={handleSearchChange}
                            />
                        </div>
                        <Button
                            variant="outline"
                            className="bg-brand-green hover:bg-brand-green/90 text-white"
                            onClick={openUserModal}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add User
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                <Table>
                    <TableHeader>
                        <TableRow>
                            {tableConfig.map((col) => (
                                col.sortKey
                                    ? <SortableHeader
                                        key={col.sortKey}
                                        sortKey={col.sortKey}
                                        currentSortKey={sortConfig.key}
                                        currentDirection={sortConfig.direction}
                                        onSort={handleSort}
                                    >
                                        {col.label}
                                    </SortableHeader>
                                    : <th key="actions" className="px-4 py-3 text-left font-medium">
                                        Actions
                                    </th>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {/* {currentData.length > 0 ? ( */}
                        {sortedAndPaginatedData.length > 0 ? (
                            sortedAndPaginatedData.map(user => (
                                <TableRow key={user.name}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            {user.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={user.isActive ? 'default' : 'secondary'}
                                            className={
                                                user.isActive
                                                    ? 'bg-brand-green text-white min-w-[80px] text-center'
                                                    : 'min-w-[80px] text-center'
                                            }
                                        >
                                            {user.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <Smartphone className="h-4 w-4 text-muted-foreground" />
                                            {`+91-${user.contact}`}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            {user.email}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{user.profileScore}</Badge>
                                    </TableCell>
                                    <TableCell className="font-medium">{user.gender}</TableCell>
                                    <TableCell className="font-medium">{user.city}</TableCell>

                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Eye
                                                className="h-5 w-5 cursor-pointer text-muted-foreground hover:text-blue-600"
                                                onClick={() => handleViewList(user, 'view')}
                                            />
                                            <Pencil
                                                className="h-5 w-5 cursor-pointer text-muted-foreground hover:text-amber-600"
                                                onClick={() => handleViewList(user, 'edit')}
                                            />
                                            <Trash
                                                className="h-5 w-5 cursor-pointer text-muted-foreground hover:text-red-600"
                                                onClick={() => openDeleteDialog(user)}
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={tableConfig.length} className="text-center py-12 text-muted-foreground">
                                    {searchText ? "No users match your search." : "No users found."}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </motion.div>

            {/* Pagination */}
            {totalItems > 0 && (
                <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    totalItems={totalItems}
                    pageSizeOptions={pageSizeOptions}
                    startItem={startItem}
                    endItem={endItem}
                    visiblePages={visiblePages}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />
            )}

            {/* Modals */}
            <CreateUserModal
                open={createUserOpen}
                closeUserModal={closeUserModal}
                handleSubmit={handleSubmit}
                loading={loading}
                formData={formData}
                editable={editable}
                showButtons={showButtons}
                deleteUser={deleteUser}
                addEditUserFlag={addEditUserFlag}
                handleInputChange={handleInputChange}
                handleUpdateList={handleUpdateList}
                openDeleteDialog={openDeleteDialog}
            />

            <DeleteConfirmationModal
                isOpen={deleteItemType}
                onClose={closeDeleteDialog}
                onConfirm={handleDeleteList}
                title={'Delete User Details'}
                message={'Are you sure you want to delete this user ?\nThis will permanently remove from your user list.'}
                itemName={deleteUser?.name}
                isLoading={false}
            />
        </div>
    )
};

export default React.memo(UsersList);